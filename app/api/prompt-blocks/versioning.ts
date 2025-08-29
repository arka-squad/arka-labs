import type { Role } from '../../../lib/auth';

export function nextVersion(current: number, role: Role) {
  return role === 'owner' ? current + 1 : current;
}

export function shouldSaveSnapshot(role: Role) {
  return role === 'owner';
}
