// Creates a couple: both partners' accounts at once, linked together. There is no way
// to sign up alone or to join an existing couple.
//
// Body: { partners: [Partner, Partner] } where Partner is
//   { handle, name, loginKey, vault: { salt, iv, wrapped_key, iterations } }
// The vault is the couple's encryption key, wrapped on the phone with that partner's PIN.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { cors, json, emailFor, normalizeHandle, passwordFor, validLoginKey } from '../_shared/accounts.ts';

interface Vault {
  salt: string;
  iv: string;
  wrapped_key: string;
  iterations: number;
}

const B64 = /^[A-Za-z0-9+/=]{8,200}$/;

function validVault(v: unknown): v is Vault {
  const vault = v as Vault;
  return (
    !!vault &&
    B64.test(vault.salt) &&
    B64.test(vault.iv) &&
    B64.test(vault.wrapped_key) &&
    Number.isInteger(vault.iterations) &&
    vault.iterations >= 100_000 &&
    vault.iterations <= 2_000_000
  );
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  const body = await req.json().catch(() => null);
  const raw = Array.isArray(body?.partners) ? body.partners : [];
  if (raw.length !== 2) return json({ error: 'Two partners are needed' }, 400);

  const partners = [];
  for (const p of raw) {
    const handle = normalizeHandle(p?.handle);
    const name = typeof p?.name === 'string' ? p.name.trim().slice(0, 40) : '';
    if (!handle) return json({ error: 'IDs use 3–20 letters, numbers, dots or underscores' }, 400);
    if (!name) return json({ error: 'Both names are needed' }, 400);
    if (!validLoginKey(p?.loginKey) || !validVault(p?.vault)) return json({ error: 'Bad request' }, 400);
    partners.push({ handle, name, loginKey: p.loginKey as string, vault: p.vault as Vault });
  }
  if (partners[0].handle === partners[1].handle) return json({ error: 'The two IDs must be different' }, 400);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

  const { data: taken } = await admin.from('profiles').select('handle').in('handle', partners.map((p) => p.handle));
  if (taken?.length) return json({ error: `The ID "${taken[0].handle}" is already taken`, taken: taken.map((t) => t.handle) }, 409);

  // Create everything; undo it all if any step fails, so no half-made couple is left
  const createdUsers: string[] = [];
  let coupleId: string | null = null;
  const undo = async () => {
    if (coupleId) await admin.from('couples').delete().eq('id', coupleId);
    for (const id of createdUsers) await admin.auth.admin.deleteUser(id);
  };

  try {
    const { data: couple, error: coupleError } = await admin.from('couples').insert({ started_on: '' }).select('id').single();
    if (coupleError || !couple) throw new Error(coupleError?.message || 'couple');
    coupleId = couple.id as string;

    for (const [i, p] of partners.entries()) {
      const { data: created, error: userError } = await admin.auth.admin.createUser({
        email: emailFor(p.handle),
        password: await passwordFor(p.handle, p.loginKey),
        email_confirm: true,
      });
      if (userError || !created.user) {
        if (/already|registered|exists/i.test(userError?.message ?? '')) {
          await undo();
          return json({ error: `The ID "${p.handle}" is already taken`, taken: [p.handle] }, 409);
        }
        throw new Error(userError?.message || 'user');
      }
      createdUsers.push(created.user.id);

      const { error: profileError } = await admin.from('profiles').insert({
        id: created.user.id,
        couple_id: coupleId,
        slot: i + 1,
        handle: p.handle,
        display_name: p.name,
      });
      if (profileError) {
        if (profileError.code === '23505') {
          await undo();
          return json({ error: `The ID "${p.handle}" is already taken`, taken: [p.handle] }, 409);
        }
        throw new Error(profileError.message);
      }

      const { error: vaultError } = await admin.from('key_vault').insert({ user_id: created.user.id, ...p.vault });
      if (vaultError) throw new Error(vaultError.message);
    }

    const { error: boardError } = await admin.from('tic_tac_toe').insert({ couple_id: coupleId });
    if (boardError) throw new Error(boardError.message);

    return json({ ok: true });
  } catch (err) {
    console.error('register failed', (err as Error).message);
    await undo();
    return json({ error: 'Could not create your space. Please try again.' }, 500);
  }
});
