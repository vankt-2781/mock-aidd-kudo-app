-- F006 — views (security_invoker), set_kudos_like RPC, auth.users profile trigger + backfill.
--
-- ROLLBACK (run in this order):
--   drop trigger if exists on_auth_user_created_kudos_profile on auth.users;
--   drop function if exists public.handle_new_auth_user();
--   drop function if exists public.set_kudos_like(uuid, boolean);
--   drop view if exists public.kudos_total, public.kudos_highlights, public.kudos_spotlight_receivers,
--     public.kudos_feed, public.profile_kudos_stats;
--   then drop tables from 000001 in reverse dependency order.

-- Views run with the CALLER's rights so table RLS applies. secret_boxes is never referenced here.
create view public.profile_kudos_stats with (security_invoker = true) as
select
  s.profile_id,
  s.kudos_received,
  s.kudos_sent,
  s.hearts_received,
  (case when s.kudos_received >= 50 then 3
        when s.kudos_received >= 20 then 2
        when s.kudos_received >= 10 then 1
        else 0 end)::int as stars
from (
  select
    p.id as profile_id,
    (select count(*) from public.kudos k where k.receiver_id = p.id)::int as kudos_received,
    (select count(*) from public.kudos k where k.sender_id = p.id)::int as kudos_sent,
    coalesce((
      select sum(l.hearts_awarded)
      from public.kudos_likes l
      join public.kudos k on k.id = l.kudos_id
      where k.sender_id = p.id
    ), 0)::int as hearts_received
  from public.profiles p
) s;

create view public.kudos_feed with (security_invoker = true) as
select
  k.id,
  k.created_at,
  k.content,
  k.images,
  k.sender_id,
  sp.display_name as sender_display_name,
  sp.avatar_url as sender_avatar_url,
  sd.code as sender_department_code,
  ss.stars as sender_stars,
  k.receiver_id,
  rp.display_name as receiver_display_name,
  rp.avatar_url as receiver_avatar_url,
  rd.code as receiver_department_code,
  rs.stars as receiver_stars,
  coalesce((
    select array_agg(h.name order by h.name)
    from public.kudos_hashtags kh
    join public.hashtags h on h.id = kh.hashtag_id
    where kh.kudos_id = k.id
  ), '{}'::text[]) as hashtag_names,
  (select count(*) from public.kudos_likes l where l.kudos_id = k.id)::int as like_count
from public.kudos k
join public.profiles sp on sp.id = k.sender_id
join public.profiles rp on rp.id = k.receiver_id
left join public.departments sd on sd.id = sp.department_id
left join public.departments rd on rd.id = rp.department_id
join public.profile_kudos_stats ss on ss.profile_id = k.sender_id
join public.profile_kudos_stats rs on rs.profile_id = k.receiver_id;

-- Top 5 by like count (ties: newest first, then id for a stable order).
create view public.kudos_highlights with (security_invoker = true) as
select * from public.kudos_feed
order by like_count desc, created_at desc, id desc
limit 5;

create view public.kudos_spotlight_receivers with (security_invoker = true) as
select
  p.id as receiver_id,
  p.display_name,
  count(*)::int as kudos_count,
  (array_agg(k.id order by k.created_at desc, k.id desc))[1] as latest_kudos_id,
  max(k.created_at) as latest_received_at
from public.kudos k
join public.profiles p on p.id = k.receiver_id
group by p.id, p.display_name;

create view public.kudos_total with (security_invoker = true) as
select count(*)::int as total from public.kudos;

revoke all on public.profile_kudos_stats, public.kudos_feed, public.kudos_highlights,
  public.kudos_spotlight_receivers, public.kudos_total from anon, authenticated;
grant select on public.profile_kudos_stats, public.kudos_feed, public.kudos_highlights,
  public.kudos_spotlight_receivers, public.kudos_total to anon, authenticated;

-- Idempotent desired-state like. Identity only from auth.uid(); hearts decided server-side.
create function public.set_kudos_like(p_kudos_id uuid, p_liked boolean)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_profile uuid;
  v_sender uuid;
  v_hearts smallint;
begin
  if v_uid is null then
    raise exception 'unauthenticated' using errcode = '28000';
  end if;
  if p_kudos_id is null or p_liked is null then
    raise exception 'invalid_argument' using errcode = '22023';
  end if;

  select id into v_profile from public.profiles where auth_user_id = v_uid;
  if v_profile is null then
    raise exception 'no_profile' using errcode = 'P0002';
  end if;

  select sender_id into v_sender from public.kudos where id = p_kudos_id;
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  if v_sender = v_profile then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if p_liked then
    v_hearts := case when exists (
      select 1 from public.special_days
      where day = (now() at time zone 'Asia/Ho_Chi_Minh')::date
    ) then 2 else 1 end;
    insert into public.kudos_likes (kudos_id, user_id, hearts_awarded)
    values (p_kudos_id, v_profile, v_hearts)
    on conflict (user_id, kudos_id) do nothing;
  else
    delete from public.kudos_likes where kudos_id = p_kudos_id and user_id = v_profile;
  end if;

  return jsonb_build_object(
    'liked', exists (select 1 from public.kudos_likes where kudos_id = p_kudos_id and user_id = v_profile),
    'like_count', (select count(*) from public.kudos_likes where kudos_id = p_kudos_id)
  );
end;
$$;

revoke all on function public.set_kudos_like(uuid, boolean) from public, anon;
grant execute on function public.set_kudos_like(uuid, boolean) to authenticated;

-- Profile provisioning. MUST NEVER block sign-up: every failure is swallowed.
create function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (auth_user_id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Sunner'
    ),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict do nothing;
  return new;
exception when others then
  return new;
end;
$$;

revoke all on function public.handle_new_auth_user() from public, anon, authenticated;

create trigger on_auth_user_created_kudos_profile
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- Backfill auth users that predate the trigger.
insert into public.profiles (auth_user_id, display_name, avatar_url)
select
  u.id,
  coalesce(
    nullif(u.raw_user_meta_data ->> 'full_name', ''),
    nullif(u.raw_user_meta_data ->> 'name', ''),
    nullif(split_part(coalesce(u.email, ''), '@', 1), ''),
    'Sunner'
  ),
  nullif(u.raw_user_meta_data ->> 'avatar_url', '')
from auth.users u
on conflict do nothing;
