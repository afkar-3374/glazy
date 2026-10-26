// Signs a partner in with their ID and PIN (sent as the stretched login key).
// After MAX_FAILURES wrong PINs the ID is locked for LOCK_MINUTES.
//
// Body: { handle, loginKey }  →  { access_token, refresh_token }
import { createClient } from 'npm:@supabase/supabase-js@2';
import { cors, json, emailFor, normalizeHandle, passwordFor, validLoginKey } from '../_shared/accounts.ts';

const MAX_FAILURES = 5;
const LOCK_MINUTES = 15;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  const body = await req.json().catch(() => null);
  const handle = normalizeHandle(body?.handle);
  if (!handle || !validLoginKey(body?.loginKey)) return json({ error: 'Wrong ID or PIN' }, 401);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

  const { data: attempt } = await admin.from('login_attempts').select('failures, locked_until').eq('handle', handle).maybeSingle();
  const lockedUntil = attempt?.locked_until ? new Date(attempt.locked_until).getTime() : 0;
  if (lockedUntil > Date.now()) {
    const minutes = Math.ceil((lockedUntil - Date.now()) / 60_000);
    return json({ error: `Too many wrong PINs. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`, locked: true }, 429);
  }

  const auth = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await auth.auth.signInWithPassword({
    email: emailFor(handle),
    password: await passwordFor(handle, body.loginKey),
  });

  if (error || !data.session) {
    // Unknown IDs count too, so the reply never tells whether an ID exists
    const failures = (lockedUntil ? 0 : attempt?.failures ?? 0) + 1;
    const lock = failures >= MAX_FAILURES;
    await admin.from('login_attempts').upsert({
      handle,
      failures: lock ? 0 : failures,
      locked_until: lock ? new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString() : null,
    });
    if (lock) return json({ error: `Too many wrong PINs. Try again in ${LOCK_MINUTES} minutes.`, locked: true }, 429);
    const left = MAX_FAILURES - failures;
    return json({ error: `Wrong ID or PIN · ${left} tr${left === 1 ? 'y' : 'ies'} left`, left }, 401);
  }

  if (attempt) await admin.from('login_attempts').delete().eq('handle', handle);
  return json({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
});
