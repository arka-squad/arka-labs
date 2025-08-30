export const memAgents: { id: number; name: string; created_at: string }[] = [];
let agentSeq = 1;
export function nextAgentId(): number {
  return agentSeq++;
}

export const memRuns = new Map<string, string>();
let runSeq = 1;
export function nextRunId(): string {
  return String(runSeq++);
}

export const memThreads = new Set<string>();

export const memMessages = new Map<string, { id: number }[]>();
let messageSeq = 1;
export function nextMessageId(): number {
  return messageSeq++;
}

export const memPins = new Map<string, number>();

export const memAborts = new Map<string, string>();
let abortSeq = 1;
export function nextAbortId(): string {
  return String(abortSeq++);
}

export const abortedThreads = new Set<string>();
