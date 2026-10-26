-- Glazy: a private space for each couple.
--
-- Every row belongs to one couple (couple_id) and only that couple's two partners can
-- read or write it. Couples are created as a pair by the `register` function; nobody can
-- sign up alone or join an existing couple. Message content, nicknames, "about", avatars,
-- moods and dates are end-to-end encrypted by the client, so the server stores ciphertext.

create extension if not exists "uuid-ossp";

-- 1. Couples and their two partners ------------------------------------------------

create table public.couples (
  id uuid primary key default gen_random_uuid(),
  started_on text default '',          -- encrypted
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  couple_id uuid not null references public.couples(id) on delete cascade,
  slot smallint not null check (slot in (1, 2)),   -- Partner 1 / Partner 2
  handle text unique not null check (handle ~ '^[a-z0-9_.]{3,20}$'),
  display_name text not null,
  nickname text default '',
  about text default '',
  avatar_url text default '',
  mood text default '',
  wallpaper text default 'botanical',
  theme text default 'rose',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (couple_id, slot)
);
create index idx_profiles_couple on public.profiles(couple_id);

-- The signed-in person's couple (null for anyone else). Used by every policy.
create or replace function public.my_couple() returns uuid
language sql stable security definer set search_path = public as $$
  select couple_id from public.profiles where id = auth.uid();
$$;
revoke all on function public.my_couple() from public, anon;
grant execute on function public.my_couple() to authenticated;

-- Kept for the edge functions: "is this caller a partner in some couple?"
create or replace function public.is_member() returns boolean
language sql stable security definer set search_path = public as $$
  select public.my_couple() is not null;
$$;
revoke all on function public.is_member() from public, anon;
grant execute on function public.is_member() to authenticated;

-- Registration screen: "is this ID free?" Says nothing else about the account.
create or replace function public.handle_available(candidate text) returns boolean
language sql stable security definer set search_path = public as $$
  select candidate ~ '^[a-z0-9_.]{3,20}$'
     and not exists (select 1 from public.profiles where handle = candidate);
$$;
revoke all on function public.handle_available(text) from public;
grant execute on function public.handle_available(text) to anon, authenticated;

-- Wrong-PIN lockout, written only by the `login` function (service role)
create table public.login_attempts (
  handle text primary key,
  failures int not null default 0,
  locked_until timestamptz
);

-- Each partner's copy of the couple's encryption key, wrapped with their PIN
create table public.key_vault (
  user_id uuid primary key references auth.users(id) on delete cascade,
  salt text not null,
  iv text not null,
  wrapped_key text not null,
  iterations int not null,
  created_at timestamptz default now()
);

-- 2. Chat ----------------------------------------------------------------------------

create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid not null default public.my_couple() references public.couples(id) on delete cascade,
  local_uuid varchar(64) unique not null,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  message_type varchar(20) default 'text',
  reply_to varchar(64),
  edited boolean default false,
  edited_at timestamptz,
  deleted boolean default false,
  deleted_at timestamptz,
  pinned boolean default false,
  starred boolean default false,
  forwarded boolean default false,
  status varchar(20) default 'sent',
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_messages_couple_created on public.messages(couple_id, created_at);

create table public.message_reactions (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid not null default public.my_couple() references public.couples(id) on delete cascade,
  message_id varchar(64) not null,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  emoji varchar(20) not null,
  created_at timestamptz default now()
);
create index idx_reactions_message_id on public.message_reactions(message_id);

-- When a message reached the partner's phone and when they read it
create or replace function public.stamp_message_receipts()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    if lower(new.status) = 'delivered' then
      new.delivered_at := coalesce(new.delivered_at, old.delivered_at, now());
    elsif lower(new.status) = 'read' then
      new.delivered_at := coalesce(new.delivered_at, old.delivered_at, now());
      new.read_at := coalesce(new.read_at, old.read_at, now());
    end if;
  end if;
  return new;
end;
$$;
create trigger stamp_message_receipts
  before update of status on public.messages
  for each row execute function public.stamp_message_receipts();

-- 3. Couple features -------------------------------------------------------------------

create table public.special_dates (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid not null default public.my_couple() references public.couples(id) on delete cascade,
  title text not null,
  date text not null,
  created_by uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  created_at timestamptz default now()
);

create table public.love_taps (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid not null default public.my_couple() references public.couples(id) on delete cascade,
  sender_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  kind text not null default 'tap' check (kind in ('tap', 'hug')),
  created_at timestamptz default now()
);
create index idx_love_taps_couple_created on public.love_taps(couple_id, created_at);

-- 4. Games, points, garden and world --------------------------------------------------

create table public.love_points (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid not null default public.my_couple() references public.couples(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  source text not null check (source in ('tap', 'hug', 'daily_question', 'know_me', 'would_you_rather', 'tic_tac_toe', 'garden', 'world')),
  points int not null check (points between 1 and 50),
  ref text not null,
  created_at timestamptz default now(),
  unique (user_id, ref)
);
create index idx_love_points_couple_created on public.love_points(couple_id, created_at);

create table public.game_answers (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid not null default public.my_couple() references public.couples(id) on delete cascade,
  game text not null check (game in ('daily_question', 'know_me', 'would_you_rather')),
  round_key text not null,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  answer text not null,                 -- encrypted
  created_at timestamptz default now(),
  unique (game, round_key, user_id)
);

-- One tic-tac-toe board per couple (created at registration)
create table public.tic_tac_toe (
  couple_id uuid primary key references public.couples(id) on delete cascade,
  round int not null default 0,
  board text not null default '---------' check (board ~ '^[-XO]{9}$'),
  x_player uuid references public.profiles(id),
  turn uuid references public.profiles(id),
  status text not null default 'idle' check (status in ('idle', 'playing', 'won', 'draw')),
  winner uuid references public.profiles(id),
  updated_at timestamptz default now()
);

create table public.garden_builds (
  couple_id uuid not null default public.my_couple() references public.couples(id) on delete cascade,
  item text not null,
  built_by uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  cost int not null check (cost > 0),
  x real,
  z real,
  rot real not null default 0,
  size real not null default 1 check (size between 0.4 and 3),
  created_at timestamptz default now(),
  primary key (couple_id, item)
);

create table public.world_avatars (
  user_id uuid primary key default auth.uid() references public.profiles(id) on delete cascade,
  couple_id uuid not null default public.my_couple() references public.couples(id) on delete cascade,
  look jsonb not null default '{}'::jsonb,
  owned text[] not null default '{}',
  spent int not null default 0 check (spent >= 0),
  updated_at timestamptz default now()
);

-- 5. Push notifications (one row per device) -------------------------------------------

create table public.push_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  endpoint text unique not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);

-- 6. Row level security -----------------------------------------------------------------

alter table public.couples enable row level security;
alter table public.profiles enable row level security;
alter table public.login_attempts enable row level security;
alter table public.key_vault enable row level security;
alter table public.messages enable row level security;
alter table public.message_reactions enable row level security;
alter table public.special_dates enable row level security;
alter table public.love_taps enable row level security;
alter table public.love_points enable row level security;
alter table public.game_answers enable row level security;
alter table public.tic_tac_toe enable row level security;
alter table public.garden_builds enable row level security;
alter table public.world_avatars enable row level security;
alter table public.push_subscriptions enable row level security;

revoke all on public.couples, public.profiles, public.login_attempts, public.key_vault, public.messages,
  public.message_reactions, public.special_dates, public.love_taps, public.love_points, public.game_answers,
  public.tic_tac_toe, public.garden_builds, public.world_avatars, public.push_subscriptions from anon;
-- Only the login function touches lockouts
revoke all on public.login_attempts from authenticated;

-- Couples: read your own; only the start date can change. Created by `register` only.
revoke insert, update, delete on public.couples from authenticated;
grant update (started_on, updated_at) on public.couples to authenticated;
create policy "couple reads couple" on public.couples
  for select to authenticated using (id = public.my_couple());
create policy "couple updates couple" on public.couples
  for update to authenticated using (id = public.my_couple()) with check (id = public.my_couple());

-- Profiles: see your couple; edit only your own personal fields (never handle, couple or slot)
revoke insert, update, delete on public.profiles from authenticated;
grant update (display_name, nickname, about, avatar_url, mood, wallpaper, theme, updated_at) on public.profiles to authenticated;
create policy "couple reads profiles" on public.profiles
  for select to authenticated using (couple_id = public.my_couple());
create policy "edit own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

revoke insert, update, delete on public.key_vault from authenticated;
create policy "read own key" on public.key_vault
  for select to authenticated using (user_id = auth.uid());

create policy "couple reads messages" on public.messages
  for select to authenticated using (couple_id = public.my_couple());
create policy "send as self" on public.messages
  for insert to authenticated with check (couple_id = public.my_couple() and sender_id = auth.uid());
create policy "couple updates messages" on public.messages
  for update to authenticated using (couple_id = public.my_couple()) with check (couple_id = public.my_couple());

create policy "couple reads reactions" on public.message_reactions
  for select to authenticated using (couple_id = public.my_couple());
create policy "react as self" on public.message_reactions
  for insert to authenticated with check (couple_id = public.my_couple() and profile_id = auth.uid());
create policy "remove own reaction" on public.message_reactions
  for delete to authenticated using (profile_id = auth.uid());

create policy "couple reads dates" on public.special_dates
  for select to authenticated using (couple_id = public.my_couple());
create policy "couple adds dates" on public.special_dates
  for insert to authenticated with check (couple_id = public.my_couple() and created_by = auth.uid());
create policy "couple edits dates" on public.special_dates
  for update to authenticated using (couple_id = public.my_couple()) with check (couple_id = public.my_couple());
create policy "couple removes dates" on public.special_dates
  for delete to authenticated using (couple_id = public.my_couple());

create policy "couple reads taps" on public.love_taps
  for select to authenticated using (couple_id = public.my_couple());
create policy "send own taps" on public.love_taps
  for insert to authenticated with check (couple_id = public.my_couple() and sender_id = auth.uid());

create policy "couple reads points" on public.love_points
  for select to authenticated using (couple_id = public.my_couple());
create policy "earn own points" on public.love_points
  for insert to authenticated with check (couple_id = public.my_couple() and user_id = auth.uid());

create policy "couple reads answers" on public.game_answers
  for select to authenticated using (couple_id = public.my_couple());
create policy "answer as self" on public.game_answers
  for insert to authenticated with check (couple_id = public.my_couple() and user_id = auth.uid());

revoke insert, delete on public.tic_tac_toe from authenticated;
create policy "couple reads board" on public.tic_tac_toe
  for select to authenticated using (couple_id = public.my_couple());
create policy "couple plays board" on public.tic_tac_toe
  for update to authenticated using (couple_id = public.my_couple()) with check (couple_id = public.my_couple());

-- Builds: either partner adds and arranges; only the layout columns can change
revoke update on public.garden_builds from authenticated;
grant update (x, z, rot, size) on public.garden_builds to authenticated;
create policy "couple sees builds" on public.garden_builds
  for select to authenticated using (couple_id = public.my_couple());
create policy "couple builds" on public.garden_builds
  for insert to authenticated with check (couple_id = public.my_couple() and built_by = auth.uid());
create policy "couple arranges builds" on public.garden_builds
  for update to authenticated using (couple_id = public.my_couple()) with check (couple_id = public.my_couple());

create policy "couple sees avatars" on public.world_avatars
  for select to authenticated using (couple_id = public.my_couple());
create policy "create own avatar" on public.world_avatars
  for insert to authenticated with check (couple_id = public.my_couple() and user_id = auth.uid());
create policy "dress own avatar" on public.world_avatars
  for update to authenticated using (user_id = auth.uid()) with check (couple_id = public.my_couple() and user_id = auth.uid());

create policy "own subscriptions read" on public.push_subscriptions
  for select to authenticated using (user_id = auth.uid());
create policy "own subscriptions add" on public.push_subscriptions
  for insert to authenticated with check (public.is_member() and user_id = auth.uid());
create policy "own subscriptions update" on public.push_subscriptions
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own subscriptions remove" on public.push_subscriptions
  for delete to authenticated using (user_id = auth.uid());

-- 7. Realtime ---------------------------------------------------------------------------
-- Table changes are filtered by the policies above. Private broadcast/presence channels
-- are named "<room>:<couple id>", and only that couple may join them.

alter publication supabase_realtime add table
  public.messages, public.message_reactions, public.profiles, public.couples, public.special_dates,
  public.love_taps, public.love_points, public.game_answers, public.tic_tac_toe, public.garden_builds,
  public.world_avatars;

create policy "couple receives realtime" on realtime.messages
  for select to authenticated using (split_part(realtime.topic(), ':', 2) = public.my_couple()::text);
create policy "couple sends realtime" on realtime.messages
  for insert to authenticated with check (split_part(realtime.topic(), ':', 2) = public.my_couple()::text);

-- 8. Private media (encrypted on the phone before upload), one folder per couple ---------

insert into storage.buckets (id, name, public)
values ('glazy-media', 'glazy-media', false)
on conflict (id) do update set public = false;

create policy "couple reads media" on storage.objects
  for select to authenticated
  using (bucket_id = 'glazy-media' and (storage.foldername(name))[1] = public.my_couple()::text);
create policy "couple uploads media" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'glazy-media' and (storage.foldername(name))[1] = public.my_couple()::text);
