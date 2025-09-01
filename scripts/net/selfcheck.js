#!/usr/bin/env node
const fs = require('fs');
const dns = require('dns');
const tls = require('tls');

const hostsEnv = process.env.HOSTS || process.env.HOST || 'www.arka-team.app arka-liard.vercel.app';
const hosts = hostsEnv.split(/\s+/).filter(Boolean).map((h) => {
  try {
    return new URL(h).hostname;
  } catch {
    return h;
  }
});

const logFile = 'logs/ui_network.json';
fs.mkdirSync('logs', { recursive: true });
fs.writeFileSync(logFile, '');

function log(entry) {
  fs.appendFileSync(logFile, JSON.stringify({ ts: new Date().toISOString(), ...entry }) + '\n');
}

(async () => {
  for (const host of hosts) {
    // DNS
    let start = Date.now();
    try {
      const addrs = await dns.promises.resolve4(host);
      log({ host, step: 'dns.resolve4', duration_ms: Date.now() - start, addrs });
    } catch (e) {
      log({ host, step: 'dns.resolve4', duration_ms: Date.now() - start, error: e.code || e.message });
    }

    // TLS handshake
    await new Promise((resolve) => {
      start = Date.now();
      const socket = tls.connect({ host, port: 443, servername: host, timeout: 5000 }, () => {
        log({ host, step: 'tls.connect', duration_ms: Date.now() - start });
        socket.end();
        resolve();
      });
      socket.on('error', (e) => {
        log({ host, step: 'tls.connect', duration_ms: Date.now() - start, error: e.code || e.message });
        resolve();
      });
      socket.on('timeout', () => {
        log({ host, step: 'tls.connect', duration_ms: Date.now() - start, error: 'ETIMEDOUT' });
        socket.destroy();
        resolve();
      });
    });
  }
})();
