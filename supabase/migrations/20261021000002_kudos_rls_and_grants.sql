-- F006 — RLS + grants. Board data is publicly readable; secret_boxes is owner-only; nobody writes directly.

alter table public.departments enable row level security;
alter table public.profiles enable row level security;
alter table public.hashtags enable row level security;
alter table public.kudos enable row level security;
alter table public.kudos_hashtags enable row level security;
alter table public.kudos_likes enable row level security;
alter table public.special_days enable row level security;
alter table public.gift_events enable row level security;
alter table public.secret_boxes enable row level security;

-- Strip Supabase's default broad grants, then re-grant read only.
revoke all on public.departments, public.profiles, public.hashtags, public.kudos,
  public.kudos_hashtags, public.kudos_likes, public.special_days, public.gift_events,
  public.secret_boxes
  from anon, authenticated;

grant select on public.departments, public.profiles, public.hashtags, public.kudos,
  public.kudos_hashtags, public.kudos_likes, public.special_days, public.gift_events,
  public.secret_boxes
  to anon, authenticated;

create policy departments_read on public.departments for select to anon, authenticated using (true);
create policy profiles_read on public.profiles for select to anon, authenticated using (true);
create policy hashtags_read on public.hashtags for select to anon, authenticated using (true);
create policy kudos_read on public.kudos for select to anon, authenticated using (true);
create policy kudos_hashtags_read on public.kudos_hashtags for select to anon, authenticated using (true);
create policy kudos_likes_read on public.kudos_likes for select to anon, authenticated using (true);
create policy special_days_read on public.special_days for select to anon, authenticated using (true);
create policy gift_events_read on public.gift_events for select to anon, authenticated using (true);

-- Owner-only; anon has the grant but auth.uid() is null so it matches no row.
create policy secret_boxes_owner_read on public.secret_boxes for select to anon, authenticated
  using (profile_id in (select id from public.profiles where auth_user_id = (select auth.uid())));

-- No insert/update/delete policies exist anywhere: writes happen only via SECURITY DEFINER functions
-- (set_kudos_like) or service role / seed.
