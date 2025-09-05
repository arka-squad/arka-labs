#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import { dirname, resolve } from 'node:path';

async function main() {
  const repoRoot = process.cwd();
  const hookSrc = resolve(repoRoot, 'scripts', 'pre-commit-secrets');
  const hookDir = resolve(repoRoot, '.git', 'hooks');
  const hookDst = resolve(hookDir, 'pre-commit');

  try {
    await fs.mkdir(hookDir, { recursive: true });
    const content = await fs.readFile(hookSrc);
    await fs.writeFile(hookDst, content, { mode: 0o755 });
    console.log('[prepare] installed .git/hooks/pre-commit');
  } catch (err) {
    console.error('[prepare] failed to install hook:', err?.message || err);
    process.exit(0); // do not block install
  }
}

main();

