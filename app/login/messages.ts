import copy from '../../arka-meta/codex/copy_catalog.json';

export const loginCopy = copy.login;

export function resolveLoginError(code?: string, network = false): string {
  if (network) return loginCopy.errors.NETWORK;
  if (code && (loginCopy.errors as any)[code]) {
    return (loginCopy.errors as any)[code] as string;
  }
  return loginCopy.errors.INVALID_CREDENTIALS;
}
