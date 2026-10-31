// Signed session cookie (Web Crypto, works in middleware and route handlers).
export const COOKIE = 'ys_session';

async function hmac(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function secret(): string {
  return (process.env.SESSION_SECRET || '') + '|' + (process.env.APP_PASSWORD || '');
}

export function authEnabled(): boolean {
  return !!process.env.APP_PASSWORD;
}

export async function makeToken(): Promise<string> {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 60; // 60 days
  return `${exp}.${await hmac(secret(), String(exp))}`;
}

export async function verifyToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return (await hmac(secret(), exp)) === sig;
}

/** Constant-time-ish comparison for the password. */
export function samePassword(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
