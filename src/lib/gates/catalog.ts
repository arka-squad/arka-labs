import { readFileSync } from 'node:fs';
import { join } from 'node:path';

type Json = any;

function loadJson(relativePath: string): Json {
  const p = join(process.cwd(), relativePath);
  const raw = readFileSync(p, 'utf-8');
  return JSON.parse(raw);
}

let cache: { gates?: any[]; recipes?: any[] } = {};

export function getGates(): any[] {
  if (!cache.gates) {
    const data = loadJson('gates/catalog/gates.json');
    cache.gates = data.items || [];
  }
  return cache.gates!;
}

export function getRecipes(): any[] {
  if (!cache.recipes) {
    const data = loadJson('gates/catalog/recipes.json');
    cache.recipes = data.items || [];
  }
  return cache.recipes!;
}

