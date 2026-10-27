-- F008 — Profile (self): the caller's own sent kudos, anonymous included, with REAL sender fields.
--
-- Same 19 columns, order and types as public.kudos_feed so the board cursor + row mapper are reused.
-- kudos.sender_id is column-revoked for clients (F007), so this must be a SECURITY DEFINER view
-- (owner postgres). It is bounded to the caller's own rows via auth.uid(); no grant to anon.
-- anonymous_name is intentionally not selected: the owner sees their real identity (BR-003).
-- Supabase advisor warning about a definer view on this one is intended.
--
-- ROLLBACK: drop view if exists public.own_sent_kudos;

create view public.own_sent_kudos as
select
  k.id,
  k.created_at,
  k.content_text as content,
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
  (select count(*) from public.kudos_likes l where l.kudos_id = k.id)::int as like_count,
  k.title,
  k.is_anonymous,
  true as viewer_is_sender
from public.kudos k
join public.profiles sp on sp.id = k.sender_id
join public.profiles rp on rp.id = k.receiver_id
left join public.departments sd on sd.id = sp.department_id
left join public.departments rd on rd.id = rp.department_id
join public.profile_kudos_stats ss on ss.profile_id = k.sender_id
join public.profile_kudos_stats rs on rs.profile_id = k.receiver_id
where k.sender_id = (select p.id from public.profiles p where p.auth_user_id = auth.uid());

alter view public.own_sent_kudos set (security_invoker = false);

revoke all on public.own_sent_kudos from public, anon, authenticated;
grant select on public.own_sent_kudos to authenticated;
