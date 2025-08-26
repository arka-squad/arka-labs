const hits = new Map<string, number[]>();

export function hit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = hits.get(key) || [];
  while (arr.length && arr[0] <= now - windowMs) arr.shift();
  arr.push(now);
  hits.set(key, arr);
  return arr.length > limit;
}
