import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.join(__dirname, '..');

function readFile(...segments: string[]): string {
  return fs.readFileSync(path.join(root, ...segments), 'utf8');
}

test('console layout exposes metadata', () => {
  const content = readFile('app', 'console', 'layout.tsx');
  assert.ok(
    content.includes('export const metadata'),
    'metadata export missing',
  );
  assert.ok(content.includes("title: 'Arka Console'"), 'console title missing');
  assert.ok(
    content.includes('Espace projet : chat multi'),
    'console description missing',
  );
});

test('cockpit layout exposes metadata', () => {
  const content = readFile('app', 'cockpit', 'layout.tsx');
  assert.ok(
    content.includes('export const metadata'),
    'metadata export missing',
  );
  assert.ok(content.includes("title: 'Arka Cockpit'"), 'cockpit title missing');
  assert.ok(
    content.includes('Interface de pilotage interne'),
    'cockpit description missing',
  );
});

test('marketing site layout keeps marketing metadata', () => {
  const content = readFile('app', '(site)', 'layout.tsx');
  assert.ok(content.includes('Arka — Cockpit IA pour piloter vos projets'));
  assert.ok(content.includes('Pilotez vos projets avec des assistants IA'));
});

test('each shell has distinct metadata', () => {
  const consoleContent = readFile('app', 'console', 'layout.tsx');
  const cockpitContent = readFile('app', 'cockpit', 'layout.tsx');
  const siteContent = readFile('app', '(site)', 'layout.tsx');

  const title = (content: string) => /title:\s*'([^']+)'/.exec(content)?.[1];
  const description = (content: string) =>
    /description:\s*'([^']+)'/.exec(content)?.[1];

  const titles = new Set([
    title(consoleContent),
    title(cockpitContent),
    title(siteContent),
  ]);
  const descriptions = new Set([
    description(consoleContent),
    description(cockpitContent),
    description(siteContent),
  ]);

  assert.equal(titles.size, 3, 'titles should differ');
  assert.equal(descriptions.size, 3, 'descriptions should differ');
});
