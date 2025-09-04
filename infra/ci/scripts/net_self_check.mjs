import { writeFileSync, appendFileSync } from 'fs';
import dns from 'dns';
import net from 'net';
import tls from 'tls';
import https from 'https';

const hosts = (process.env.HOSTS || 'www.arka-squad.app arka-liard.vercel.app').split(/\s+/).filter(Boolean);
const logFile = 'logs/net_self_check.ndjson';
writeFileSync(logFile, '');

function log(obj) {
  appendFileSync(logFile, JSON.stringify({ ts: new Date().toISOString(), ...obj }) + '\n');
}

for (const host of hosts) {
  const env = {
    http_proxy: process.env.http_proxy || process.env.HTTP_PROXY || null,
    https_proxy: process.env.https_proxy || process.env.HTTPS_PROXY || null,
    all_proxy: process.env.all_proxy || process.env.ALL_PROXY || null,
    no_proxy: process.env.no_proxy || process.env.NO_PROXY || null,
  };
  log({ host, step: 'env', env });
  // DNS
  let start = Date.now();
  try {
    const addrs = await dns.promises.resolve4(host);
    log({ host, step: 'dns.resolve4', duration_ms: Date.now() - start, addrs });
  } catch (e) {
    log({ host, step: 'dns.resolve4', duration_ms: Date.now() - start, code: '000', error: e.code || e.message });
  }
  // TCP
  await new Promise((resolve) => {
    start = Date.now();
    const socket = net.connect({ host, port: 443, timeout: 5000 }, () => {
      log({ host, step: 'tcp.connect', duration_ms: Date.now() - start });
      socket.end();
      resolve();
    });
    socket.on('error', (e) => {
      log({ host, step: 'tcp.connect', duration_ms: Date.now() - start, code: '000', error: e.code || e.message });
      resolve();
    });
    socket.on('timeout', () => {
      log({ host, step: 'tcp.connect', duration_ms: Date.now() - start, code: '000', error: 'ETIMEDOUT' });
      socket.destroy();
      resolve();
    });
  });
  // TLS
  await new Promise((resolve) => {
    start = Date.now();
    const tlssock = tls.connect({ host, servername: host, port: 443, timeout: 5000 }, () => {
      const cert = tlssock.getPeerCertificate();
      log({ host, step: 'tls.connect', duration_ms: Date.now() - start, peer: { cn: cert.subject?.CN, issuer: cert.issuer?.CN } });
      tlssock.end();
      resolve();
    });
    tlssock.on('error', (e) => {
      log({ host, step: 'tls.connect', duration_ms: Date.now() - start, code: '000', error: e.code || e.message });
      resolve();
    });
    tlssock.on('timeout', () => {
      log({ host, step: 'tls.connect', duration_ms: Date.now() - start, code: '000', error: 'ETIMEDOUT' });
      tlssock.destroy();
      resolve();
    });
  });
  // HTTPS GET
  await new Promise((resolve) => {
    start = Date.now();
    const req = https.get({ host, port: 443, path: '/api/health', timeout: 5000 }, (res) => {
      res.on('data', () => {});
      res.on('end', () => {
        log({ host, step: 'https.get', duration_ms: Date.now() - start, status: res.statusCode });
        resolve();
      });
    });
    req.on('error', (e) => {
      log({ host, step: 'https.get', duration_ms: Date.now() - start, status: '000', error: e.code || e.message });
      resolve();
    });
    req.on('timeout', () => {
      log({ host, step: 'https.get', duration_ms: Date.now() - start, status: '000', error: 'ETIMEDOUT' });
      req.destroy();
      resolve();
    });
  });
}
