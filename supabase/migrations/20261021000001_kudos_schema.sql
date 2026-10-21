-- F006 Kudos Live Board — schema (tables, indexes, FKs). RLS/grants in 000002, views/RPC/trigger in 000003.

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  -- null for seeded personas; set null (not cascade) so deleting an auth user releases a claimed persona
  auth_user_id uuid unique references auth.users (id) on delete set null,
  display_name text not null,
  avatar_url text,
  department_id uuid references public.departments (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.hashtags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table public.kudos (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  receiver_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  images text[] not null default '{}',
  created_at timestamptz not null default now(),
  constraint kudos_sender_not_receiver check (sender_id <> receiver_id)
);

create table public.kudos_hashtags (
  kudos_id uuid not null references public.kudos (id) on delete cascade,
  hashtag_id uuid not null references public.hashtags (id) on delete cascade,
  primary key (kudos_id, hashtag_id)
);

create table public.kudos_likes (
  id uuid primary key default gen_random_uuid(),
  kudos_id uuid not null references public.kudos (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  hearts_awarded smallint not null check (hearts_awarded in (1, 2)),
  created_at timestamptz not null default now(),
  constraint kudos_likes_user_kudos_unique unique (user_id, kudos_id)
);

create table public.special_days (
  day date primary key,
  multiplier smallint not null default 2 check (multiplier = 2)
);

create table public.gift_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  description text not null,
  created_at timestamptz not null default now()
);

create table public.secret_boxes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  opened_at timestamptz
);

create index kudos_created_at_id_idx on public.kudos (created_at desc, id desc);
create index kudos_receiver_id_idx on public.kudos (receiver_id);
create index kudos_sender_id_idx on public.kudos (sender_id);
create index kudos_likes_kudos_id_idx on public.kudos_likes (kudos_id);
create index kudos_hashtags_hashtag_id_idx on public.kudos_hashtags (hashtag_id);
create index gift_events_created_at_idx on public.gift_events (created_at desc);
create index profiles_department_id_idx on public.profiles (department_id);
create index secret_boxes_profile_id_idx on public.secret_boxes (profile_id);
