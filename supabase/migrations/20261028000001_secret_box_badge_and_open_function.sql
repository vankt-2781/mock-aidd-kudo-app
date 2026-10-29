-- F009 — Open Secret Box: badge column + open_secret_box() RPC.
--
-- Weighted draw (cumulative bounds on floor(random()*100), i.e. 0..99):
--   stay_gold 30 | flow_to_horizon 25 | beyond_the_boundary 10 | root_further 5 | touch_of_light 20 | revival 10
-- Changing the weights requires a NEW migration that replaces the function.
-- Legacy opened boxes keep badge = null.
--
-- ROLLBACK (run in this order):
--   drop function if exists public.open_secret_box();
--   alter table public.secret_boxes drop constraint if exists secret_boxes_badge_opened_check;
--   alter table public.secret_boxes drop constraint if exists secret_boxes_badge_key_check;
--   alter table public.secret_boxes drop column if exists badge;

alter table public.secret_boxes add column badge text;

alter table public.secret_boxes
  add constraint secret_boxes_badge_key_check check (
    badge is null or badge in (
      'stay_gold', 'flow_to_horizon', 'beyond_the_boundary', 'root_further', 'touch_of_light', 'revival'
    )
  ),
  add constraint secret_boxes_badge_opened_check check (badge is null or opened_at is not null);

create function public.open_secret_box()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_profile uuid;
  v_box uuid;
  v_roll int;
  v_badge text;
begin
  if v_uid is null then
    raise exception 'unauthenticated' using errcode = '28000';
  end if;

  select id into v_profile from public.profiles where auth_user_id = v_uid;
  if v_profile is null then
    raise exception 'no_profile' using errcode = 'P0002';
  end if;

  -- Claim exactly one unopened box; concurrent callers skip rows locked by others.
  select id into v_box
  from public.secret_boxes
  where profile_id = v_profile and opened_at is null
  order by id
  limit 1
  for update skip locked;
  if v_box is null then
    raise exception 'no_unopened_box' using errcode = 'P0001';
  end if;

  v_roll := floor(random() * 100)::int;
  v_badge := case
    when v_roll < 30 then 'stay_gold'
    when v_roll < 55 then 'flow_to_horizon'
    when v_roll < 65 then 'beyond_the_boundary'
    when v_roll < 70 then 'root_further'
    when v_roll < 90 then 'touch_of_light'
    else 'revival'
  end;

  update public.secret_boxes set opened_at = now(), badge = v_badge where id = v_box;

  return jsonb_build_object(
    'badge', v_badge,
    'remaining_unopened',
    (select count(*)::int from public.secret_boxes where profile_id = v_profile and opened_at is null)
  );
end;
$$;

revoke all on function public.open_secret_box() from public, anon;
grant execute on function public.open_secret_box() to authenticated;
