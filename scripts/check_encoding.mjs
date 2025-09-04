#!/usr/bin/env node
// Simple scan for mojibake markers that usually indicate non‑UTF8 source.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const BAD = [
  'Ã', // Ã©, Ã , etc.
  'â€“', 'â€”', 'â€˜', 'â€™', 'â€œ', 'â€',
  '', '�',
];
const exts = new Set(['.ts', '.tsx', '.js', '.jsx', '.md']);

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === '.next' || name === '.git') continue;
      yield* walk(p);
    } else {
      const m = name.match(/\.[^./]+$/);
      if (m && exts.has(m[0])) yield p;
    }
  }
}

let badCount = 0;
for (const file of walk(ROOT)) {
  const text = readFileSync(file, 'utf8');
  if (BAD.some((pat) => text.includes(pat))) {
    badCount++;
    console.log(`encoding-warning: ${file}`);
  }
}

if (badCount > 0) {
  console.log(`Found ${badCount} files potentially not UTF-8 clean.`);
  process.exit(0); // warn-only in CI for now
}

