-- F007 — atomic send_kudos RPC. Sender is always derived from auth.uid(); the client never supplies it.
--
-- ROLLBACK: drop table if exists public.kudos_image_uploads; drop function if exists public.send_kudos(uuid, text, text, text, text[], text[], boolean, text);
--           drop table if exists public.app_settings;

-- Settings consumed by definer functions. Service-role managed; clients get no access.
-- PER ENVIRONMENT: update storage_public_base to that environment's Supabase origin
-- (local CLI default below; production e.g. https://<project-ref>.supabase.co).
create table if not exists public.app_settings (
  key text primary key,
  value text not null
);
alter table public.app_settings enable row level security;
revoke all on public.app_settings from anon, authenticated;
insert into public.app_settings (key, value)
  values ('storage_public_base', 'http://127.0.0.1:54321')
  on conflict (key) do nothing;

-- Ownership registry for uploaded images. Storage paths are `<random uuid>/<random uuid>.<ext>` and
-- carry NO user identity (anonymous kudos publish these URLs); this table is the only owner link.
-- Definer-only: clients get no grants and no policies.
create table if not exists public.kudos_image_uploads (
  path text primary key,
  owner uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists kudos_image_uploads_owner_created_idx on public.kudos_image_uploads (owner, created_at);
alter table public.kudos_image_uploads enable row level security;
revoke all on public.kudos_image_uploads from anon, authenticated;
--
-- content (p_content) is UNTRUSTED HTML at rest: the server action sanitizes, but this function is
-- callable directly via PostgREST. Any HTML render must re-sanitize; the board renders content_text.

create function public.send_kudos(
  p_receiver_id uuid,
  p_title text,
  p_content text,
  p_content_text text,
  p_hashtags text[],
  p_images text[],
  p_is_anonymous boolean,
  p_anonymous_name text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_sender uuid;
  v_title text := nullif(btrim(p_title), '');
  v_text text := btrim(p_content_text);
  v_anon_name text := nullif(btrim(p_anonymous_name), '');
  v_tags text[];
  v_url text;
  v_prefix text;
  v_base text;
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'unauthenticated' using errcode = '28000';
  end if;

  select id into v_sender from public.profiles where auth_user_id = v_uid;
  if v_sender is null then
    raise exception 'no_profile' using errcode = 'P0002';
  end if;

  if p_receiver_id is null then
    raise exception 'invalid_argument:receiver' using errcode = '22023';
  end if;
  if p_content is null then
    raise exception 'invalid_argument:content' using errcode = '22023';
  end if;
  if p_is_anonymous is null then
    raise exception 'invalid_argument:is_anonymous' using errcode = '22023';
  end if;

  if not exists (select 1 from public.profiles where id = p_receiver_id) then
    raise exception 'receiver_not_found' using errcode = 'P0002';
  end if;
  if p_receiver_id = v_sender then
    raise exception 'self_kudos' using errcode = '42501';
  end if;

  if char_length(p_content) > 50000 then
    raise exception 'invalid_argument:content' using errcode = '22023';
  end if;
  if v_text is null or char_length(v_text) not between 1 and 5000 then
    raise exception 'invalid_argument:content_text' using errcode = '22023';
  end if;
  if v_title is not null and char_length(v_title) > 60 then
    raise exception 'invalid_argument:title' using errcode = '22023';
  end if;
  if v_anon_name is not null and (not p_is_anonymous or char_length(v_anon_name) > 30) then
    raise exception 'invalid_argument:anonymous_name' using errcode = '22023';
  end if;

  -- Hashtags: trim, strip leading '#', drop case-insensitive duplicates (first spelling wins), 1..5.
  select coalesce(array_agg(t.name order by t.ord), '{}'::text[]) into v_tags
  from (
    select distinct on (lower(n.name)) n.name, n.ord
    from (
      select btrim(regexp_replace(raw, '^#+', '')) as name, ord
      from unnest(coalesce(p_hashtags, '{}'::text[])) with ordinality as u(raw, ord)
    ) n
    where n.name <> ''
    order by lower(n.name), n.ord
  ) t;
  if coalesce(array_length(v_tags, 1), 0) not between 1 and 5 then
    raise exception 'invalid_argument:hashtags' using errcode = '22023';
  end if;
  if exists (select 1 from unnest(v_tags) as x(name) where char_length(x.name) > 30) then
    raise exception 'invalid_argument:hashtags' using errcode = '22023';
  end if;
  -- New names only: letters, digits, underscore. Existing names (e.g. "IDOL GIỚI TRẺ") stay valid.
  if exists (
    select 1 from unnest(v_tags) as x(name)
    where x.name !~ '^[[:alnum:]_]+$'
      and not exists (select 1 from public.hashtags h where lower(h.name) = lower(x.name))
  ) then
    raise exception 'invalid_argument:hashtags' using errcode = '22023';
  end if;

  -- Images: <= 5, each a public kudos-images URL whose object path the CALLER reserved
  -- (kudos_image_uploads). The path embeds no identity; ownership lives in the registry.
  if coalesce(array_length(p_images, 1), 0) > 5 then
    raise exception 'invalid_argument:images' using errcode = '22023';
  end if;
  -- Anchor the FULL origin: a URL on a foreign host must be refused even though
  -- its path mimics the bucket layout (the RPC is callable directly via PostgREST).
  select value into v_base from public.app_settings where key = 'storage_public_base';
  v_prefix := '/storage/v1/object/public/kudos-images/';
  foreach v_url in array coalesce(p_images, '{}'::text[]) loop
    if v_url is null
       or v_base is null
       or char_length(v_url) > 500
       or strpos(v_url, v_base || v_prefix) <> 1
       or v_url ~ '\.\.'
       or substr(v_url, char_length(v_base || v_prefix) + 1)
            !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png)$'
       or not exists (
         select 1 from public.kudos_image_uploads r
         where r.path = substr(v_url, char_length(v_base || v_prefix) + 1) and r.owner = v_uid
       ) then
      raise exception 'invalid_argument:images' using errcode = '22023';
    end if;
  end loop;

  insert into public.kudos (sender_id, receiver_id, title, content, content_text, images, is_anonymous, anonymous_name)
  values (v_sender, p_receiver_id, v_title, p_content, v_text, coalesce(p_images, '{}'::text[]),
          p_is_anonymous, v_anon_name)
  returning id into v_id;

  insert into public.hashtags (name)
  select x.name from unnest(v_tags) as x(name)
  on conflict do nothing;

  insert into public.kudos_hashtags (kudos_id, hashtag_id)
  select v_id, h.id from public.hashtags h where lower(h.name) in (select lower(x.name) from unnest(v_tags) as x(name));

  return v_id;
end;
$$;

revoke all on function public.send_kudos(uuid, text, text, text, text[], text[], boolean, text) from public, anon;
grant execute on function public.send_kudos(uuid, text, text, text, text[], text[], boolean, text) to authenticated;
