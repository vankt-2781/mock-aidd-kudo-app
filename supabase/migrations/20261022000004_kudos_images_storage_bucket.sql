-- F007 — kudos-images bucket: public read by URL, authenticated upload only to paths reserved via reserve_kudos_image_path.
-- No select/update/delete policies: public URLs need none; clients cannot delete (orphans accepted).
--
-- ROLLBACK:
--   drop policy if exists kudos_images_insert_reserved on storage.objects;
--   drop function if exists public.reserve_kudos_image_path(text), public.is_reserved_kudos_image_path(text);
--   -- delete objects via the Storage API first, then:
--   delete from storage.buckets where id = 'kudos-images';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('kudos-images', 'kudos-images', true, 5242880, '{image/jpeg,image/png}')
on conflict (id) do nothing;

-- Paths carry no user identity. A client may insert only a path it reserved through
-- reserve_kudos_image_path (registry owner = caller).
-- The registry has no client grants, so the policy asks a definer predicate instead of reading it.
create function public.is_reserved_kudos_image_path(p_path text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.kudos_image_uploads r
    where r.path = p_path and r.owner = (select auth.uid())
  );
$$;
revoke all on function public.is_reserved_kudos_image_path(text) from public, anon;
grant execute on function public.is_reserved_kudos_image_path(text) to authenticated;

create policy kudos_images_insert_reserved on storage.objects
  for insert to authenticated
  with check (bucket_id = 'kudos-images' and public.is_reserved_kudos_image_path(name));

-- Reserves a fresh, identity-free object path for the caller. Cheap abuse limit: at most 25
-- reservations per user per hour.
create function public.reserve_kudos_image_path(p_ext text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_path text;
begin
  if v_uid is null then
    raise exception 'unauthenticated' using errcode = '28000';
  end if;
  if p_ext is null or p_ext not in ('jpg', 'jpeg', 'png') then
    raise exception 'invalid_argument:ext' using errcode = '22023';
  end if;
  if (select count(*) from public.kudos_image_uploads r
      where r.owner = v_uid and r.created_at > now() - interval '1 hour') >= 25 then
    raise exception 'rate_limited' using errcode = '54000';
  end if;
  v_path := gen_random_uuid()::text || '/' || gen_random_uuid()::text || '.' || p_ext;
  insert into public.kudos_image_uploads (path, owner) values (v_path, v_uid);
  return v_path;
end;
$$;

revoke all on function public.reserve_kudos_image_path(text) from public, anon;
grant execute on function public.reserve_kudos_image_path(text) to authenticated;
