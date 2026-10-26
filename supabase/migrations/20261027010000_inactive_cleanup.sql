-- Couple spaces nobody has opened for 30 days are deleted, with everything in them.
--
-- The app calls touch_activity() when a partner unlocks it (at most once an hour counts).
-- Every night the `cleanup-inactive` function removes couples whose last activity is older
-- than 30 days: their files, both accounts and all their rows.

alter table public.couples add column last_active_at timestamptz not null default now();
create index idx_couples_last_active on public.couples(last_active_at);

create or replace function public.touch_activity() returns void
language sql volatile security definer set search_path = public as $$
  update public.couples
     set last_active_at = now()
   where id = public.my_couple()
     and last_active_at < now() - interval '1 hour';
$$;
revoke all on function public.touch_activity() from public, anon;
grant execute on function public.touch_activity() to authenticated;

-- Nightly run (03:15 India time = 21:45 UTC). The function URL and its secret live in
-- Vault ('glazy_project_url', 'glazy_cron_secret'), set once outside of git.
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'glazy-cleanup-inactive',
  '45 21 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'glazy_project_url') || '/functions/v1/cleanup-inactive',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'glazy_cron_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
  $$
);
