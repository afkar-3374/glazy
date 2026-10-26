// Deletes couple spaces that nobody has opened for INACTIVE_DAYS: their encrypted files,
// both accounts and every row (rows go with the couple through `on delete cascade`).
// Called nightly by pg_cron with the x-cron-secret header.
// Secrets: CRON_SECRET
import { createClient } from 'npm:@supabase/supabase-js@2';

const INACTIVE_DAYS = 30;
const BUCKET = 'glazy-media';
const BATCH = 25;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  const secret = Deno.env.get('CRON_SECRET');
  if (!secret || req.headers.get('x-cron-secret') !== secret) return json({ error: 'forbidden' }, 403);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });
  const cutoff = new Date(Date.now() - INACTIVE_DAYS * 86_400_000).toISOString();

  const { data: couples, error } = await admin.from('couples').select('id').lt('last_active_at', cutoff).limit(BATCH);
  if (error) return json({ error: error.message }, 500);

  let deleted = 0;
  for (const { id } of couples ?? []) {
    try {
      // 1. Files: everything under "<couple id>/"
      for (const folder of [`${id}/m`, id]) {
        for (;;) {
          const { data: files } = await admin.storage.from(BUCKET).list(folder, { limit: 100 });
          const paths = (files ?? []).filter((f) => f.id).map((f) => `${folder}/${f.name}`);
          if (!paths.length) break;
          const { error: removeError } = await admin.storage.from(BUCKET).remove(paths);
          if (removeError) throw new Error(removeError.message);
        }
      }

      // 2. Both accounts (their profiles, keys and devices go with them)
      const { data: partners } = await admin.from('profiles').select('id, handle').eq('couple_id', id);
      for (const p of partners ?? []) {
        await admin.auth.admin.deleteUser(p.id);
        await admin.from('login_attempts').delete().eq('handle', p.handle);
      }

      // 3. The couple and all of its rows
      await admin.from('couples').delete().eq('id', id);
      deleted += 1;
    } catch (err) {
      console.error('cleanup failed for a couple', (err as Error).message);
    }
  }

  return json({ deleted, more: (couples?.length ?? 0) === BATCH });
});
