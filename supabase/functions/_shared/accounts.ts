// Shared by `register` and `login`.
//
// The phone never sends the PIN itself: it sends a "login key" stretched from the PIN
// (PBKDF2, salted with the handle). The account password is an HMAC of that key with
// LOGIN_PEPPER, a secret only these functions know. So nobody can sign in by calling
// Supabase Auth directly with a guessed PIN; every attempt goes through `login`, which
// locks an ID after too many wrong PINs.
// Secrets: LOGIN_PEPPER (long random string; never change it once couples exist)

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

export const HANDLE_RE = /^[a-z0-9_.]{3,20}$/;
const LOGIN_KEY_RE = /^[A-Za-z0-9+/=]{40,64}$/;

export function normalizeHandle(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const handle = value.trim().toLowerCase();
  return HANDLE_RE.test(handle) ? handle : null;
}

export function validLoginKey(value: unknown): value is string {
  return typeof value === 'string' && LOGIN_KEY_RE.test(value);
}

/** Auth accounts are addressed by handle; the address never receives mail. */
export const emailFor = (handle: string) => `${handle}@users.glazy.app`;

export async function passwordFor(handle: string, loginKey: string): Promise<string> {
  const pepper = Deno.env.get('LOGIN_PEPPER');
  if (!pepper || pepper.length < 32) throw new Error('LOGIN_PEPPER is not set');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pepper), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${handle}:${loginKey}`));
  return Array.from(new Uint8Array(mac), (b) => b.toString(16).padStart(2, '0')).join('');
}
