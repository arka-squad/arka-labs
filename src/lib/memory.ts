import fs from 'fs';
import path from 'path';

export async function appendMemory(agent: string, line: string, date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const dir = path.join('.governance', 'projects', 'arka', 'agent_memories', agent, String(year), month);
  await fs.promises.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${year}-${month}-${day}.jsonl`);
  await fs.promises.appendFile(file, line + '\n');
}
