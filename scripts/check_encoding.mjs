#!/usr/bin/env node
// Fail CI if potential mojibake (bad encoding) is detected in source files.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const BAD_FRAGMENTS = ['Ã', 'Â', 'â€™', 'â€“', 'â€”', 'â€œ', 'â€', '�'];
const EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.md', '.tsx']);

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next' || name === '.git') continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      yield* walk(p);
    } else {
      if (EXTS.has(extname(name))) yield p;
    }
  }
}

let bad = [];
for (const file of walk(ROOT)) {
  const text = readFileSync(file, 'utf8');
  if (BAD_FRAGMENTS.some((pat) => text.includes(pat))) bad.push(file);
}

if (bad.length) {
  console.error('Encoding check failed. Possible mojibake in:');
  for (const f of bad) console.error(' -', f);
  process.exit(1);
}
console.log('Encoding check OK');

