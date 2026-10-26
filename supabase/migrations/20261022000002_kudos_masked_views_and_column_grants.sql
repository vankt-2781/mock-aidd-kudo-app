-- F007 — hide kudos.sender_id from clients; masked SECURITY DEFINER views are the only path to sender data.
--
-- Definer views run as the owner (postgres) and bypass RLS/column grants on purpose: each one lists
-- its columns explicitly (no k.*) and masks the sender of anonymous kudos. Supabase advisor warnings
-- about definer views on these four are intended.
--
-- ROLLBACK (ordered):
--   1. drop view public.viewer_profile;
--   2. drop view public.viewer_kudos_stats;
--   3. drop views public.kudos_highlights, public.kudos_feed, public.profile_kudos_stats,
--      then recreate the three exactly as in 20261021000003 (security_invoker);
--   4. grant select on public.profiles to anon, authenticated;  -- restores auth_user_id visibility
--   5. recreate the secret_boxes owner policy as written in 20261021000002;
--   6. grant select on public.kudos to anon, authenticated;     -- restores sender_id visibility
--
-- profiles.auth_user_id is the join key to auth.users and to anything that embeds an auth uid;
-- clients never need it. Column grants hide it; the owner's own row is served by viewer_profile.
revoke select on public.profiles from anon, authenticated;
grant select (id, display_name, avatar_url, department_id, created_at)
  on public.profiles to anon, authenticated;

-- The signed-in user's own profile (all columns). Definer so it can read the hidden column.
create view public.viewer_profile as
select p.* from public.profiles p where p.auth_user_id = auth.uid();
revoke all on public.viewer_profile from anon, authenticated;
grant select on public.viewer_profile to authenticated;

-- secret_boxes owner policy used a profiles.auth_user_id subquery (needs the hidden column).
-- Guests never read it (owner-only), so the anon grant goes too.
revoke select on public.secret_boxes from anon;
drop policy secret_boxes_owner_read on public.secret_boxes;
create policy secret_boxes_owner_read on public.secret_boxes for select to authenticated
  using (profile_id in (select id from public.viewer_profile));

revoke select on public.kudos from anon, authenticated;
--         grant select on public.kudos to anon, authenticated;

revoke select on public.kudos from anon, authenticated;
grant select (id, receiver_id, content, images, created_at, title, content_text, is_anonymous, anonymous_name)
  on public.kudos to anon, authenticated;

drop view public.kudos_highlights;
drop view public.kudos_feed;
drop view public.profile_kudos_stats;

-- Public stats: anonymous kudos never count toward a sender's visible sent total or hearts.
create view public.profile_kudos_stats as
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
    (select count(*) from public.kudos k where k.sender_id = p.id and not k.is_anonymous)::int as kudos_sent,
    coalesce((
      select sum(l.hearts_awarded)
      from public.kudos_likes l
      join public.kudos k on k.id = l.kudos_id
      where k.sender_id = p.id and not k.is_anonymous
    ), 0)::int as hearts_received
  from public.profiles p
) s;

-- Owner-only: the signed-in user's own row, counting everything including anonymous kudos.
create view public.viewer_kudos_stats as
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
  where p.auth_user_id = auth.uid()
) s;

create view public.kudos_feed as
select
  k.id,
  k.created_at,
  k.content_text as content,
  k.images,
  case when k.is_anonymous then null else k.sender_id end as sender_id,
  case when k.is_anonymous then coalesce(k.anonymous_name, 'Ẩn danh') else sp.display_name end as sender_display_name,
  case when k.is_anonymous then null else sp.avatar_url end as sender_avatar_url,
  case when k.is_anonymous then null else sd.code end as sender_department_code,
  case when k.is_anonymous then null else ss.stars end as sender_stars,
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
  (select count(*) from public.kudos_likes l where l.kudos_id = k.id)::int as like_count,
  k.title,
  k.is_anonymous,
  coalesce(k.sender_id = (select p.id from public.profiles p where p.auth_user_id = auth.uid()), false) as viewer_is_sender
from public.kudos k
join public.profiles sp on sp.id = k.sender_id
join public.profiles rp on rp.id = k.receiver_id
left join public.departments sd on sd.id = sp.department_id
left join public.departments rd on rd.id = rp.department_id
join public.profile_kudos_stats ss on ss.profile_id = k.sender_id
join public.profile_kudos_stats rs on rs.profile_id = k.receiver_id;

-- Top 5 by like count (ties: newest first, then id). Explicit columns: same shape as kudos_feed.
create view public.kudos_highlights as
select
  id, created_at, content, images, sender_id, sender_display_name, sender_avatar_url,
  sender_department_code, sender_stars, receiver_id, receiver_display_name, receiver_avatar_url,
  receiver_department_code, receiver_stars, hashtag_names, like_count, title, is_anonymous, viewer_is_sender
from public.kudos_feed
order by like_count desc, created_at desc, id desc
limit 5;

revoke all on public.profile_kudos_stats, public.kudos_feed, public.kudos_highlights,
  public.viewer_kudos_stats from anon, authenticated;
grant select on public.profile_kudos_stats, public.kudos_feed, public.kudos_highlights to anon, authenticated;
grant select on public.viewer_kudos_stats to authenticated;
