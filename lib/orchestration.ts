import { promises as fs } from 'fs';
import path from 'path';
import { generateTraceId } from './trace';

export type State = 'DRAFT' | 'CODING' | 'QA' | 'ARC' | 'DONE';
export type Event = 'START' | 'PASS' | 'FAIL' | 'FIX';

export interface EventLogEntry {
  ts: string;
  trace_id: string;
  state_from: State;
  state_to: State;
  actor: string;
  note?: string;
}

const transitions: Record<State, Partial<Record<Event, State>>> = {
  DRAFT: { START: 'CODING' },
  CODING: { PASS: 'QA', FIX: 'QA' },
  QA: { PASS: 'ARC', FAIL: 'CODING' },
  ARC: { PASS: 'DONE', FAIL: 'CODING' },
  DONE: {},
};

const logFile = path.join(process.cwd(), 'logs_orchestration.json');

const EVENT_LOG: EventLogEntry[] = (globalThis as any).__EVENT_LOG__ ||
  ((globalThis as any).__EVENT_LOG__ = []);

async function logEvent(entry: EventLogEntry) {
  EVENT_LOG.push(entry);
  try {
    await fs.appendFile(logFile, JSON.stringify(entry) + '\n');
  } catch {
    // ignore logging errors
  }
}

export function getEventLog() {
  return EVENT_LOG;
}

async function apply(
  trace_id: string,
  state: State,
  event: Event,
  actor: string
): Promise<State> {
  const next = transitions[state][event];
  if (!next) throw new Error(`invalid transition ${state} + ${event}`);
  await logEvent({
    ts: new Date().toISOString(),
    trace_id,
    state_from: state,
    state_to: next,
    actor,
    note: event,
  });
  return next;
}

export async function runLot(actor = 'system') {
  const trace_id = generateTraceId();
  let state: State = 'DRAFT';
  state = await apply(trace_id, state, 'START', actor);
  state = await apply(trace_id, state, 'PASS', actor);
  state = await apply(trace_id, state, 'PASS', actor);
  await apply(trace_id, state, 'PASS', actor);
}

