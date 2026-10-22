-- F006 Kudos Live Board — deterministic seed (runs after migrations on `supabase db reset`).
-- Fixed UUIDs: ('00000000-0000-4000-8000-' || lpad(base+n, 12, '0')) via pg_temp.sid(base, n)
--   departments   100+n   (CEVC1..CEVC10 = 101..110, CEVC99 = 199)
--   hashtags      200+n   (1..8, see list below)
--   named Sunners 10000+n (1..60); E2E Persona = 10100
--   likers        20000+n (1..1000)
--   kudos         30000+n (1..388; n=1 is newest)
--   likes         100000+seq, gift_events 500+n, secret_boxes 1000+n
-- e2e mirrors these in e2e/helpers/kudos-seed-constants.ts.
-- Reserved kudos numbers: top-5 liked = 10,20,30,40,50 | persona sent = 101..125 | persona received = 126..150
--                         like-target (0 likes) = 201..204 | Pioneer hashtag = 301..312

create function pg_temp.sid(base bigint, n bigint) returns uuid
language sql immutable as
$$ select ('00000000-0000-4000-8000-' || lpad((base + n)::text, 12, '0'))::uuid $$;

-- Departments ---------------------------------------------------------------
insert into public.departments (id, code, name)
select pg_temp.sid(100, g), 'CEVC' || g, 'Division CEVC' || g from generate_series(1, 10) g;
insert into public.departments (id, code, name)
values (pg_temp.sid(100, 99), 'CEVC99', 'Division CEVC99 (empty)');

-- Hashtags (stored without '#') ---------------------------------------------
insert into public.hashtags (id, name)
select pg_temp.sid(200, i), n
from unnest(array['Dedicated','Inspring','Teamwork','Creative','Supportive','Leadership','IDOL GIỚI TRẺ','Pioneer'])
  with ordinality as t(n, i);

-- Profiles ------------------------------------------------------------------
insert into public.profiles (id, auth_user_id, display_name, department_id)
select pg_temp.sid(10000, i), null, n, pg_temp.sid(100, ((i - 1) % 10) + 1)
from unnest(array[
  'Huỳnh Dương Xuân','Huỳnh Dương Xuân Nhật','Nguyễn Bá Chức','Đỗ hoàng Hiệp','Trần Minh Anh',
  'Lê Thị Bích Ngọc','Phạm Quốc Bảo','Vũ Thanh Hà','Đặng Hoàng Long','Bùi Thu Trang',
  'Ngô Gia Huy','Dương Khánh Linh','Lý Anh Tuấn','Hoàng Mai Phương','Phan Đức Thịnh',
  'Võ Ngọc Diệp','Đinh Công Minh','Trịnh Hải Yến','Mai Văn Khoa','Cao Thị Lan',
  'Lương Quang Vinh','Tô Bảo Châu','Hà Minh Tâm','Nguyễn Thùy Dung','Trần Đình Phúc',
  'Lê Hữu Nghĩa','Phạm Thị Hồng','Vũ Đức Anh','Đặng Thu Hiền','Bùi Quang Hải',
  'Ngô Thanh Tùng','Dương Mỹ Linh','Lý Hoài Nam','Hoàng Kim Ngân','Phan Thế Vinh',
  'Võ Thị Thanh','Đinh Bảo Ngọc','Trịnh Quốc Việt','Mai Thùy Chi','Cao Minh Nhật',
  'Lương Thị Hạnh','Tô Đức Tài','Hà Phương Thảo','Nguyễn Văn Sơn','Trần Thị Mỹ',
  'Lê Quốc Đạt','Phạm Hoài An','Vũ Ngọc Ánh','Đặng Văn Lộc','Bùi Thị Kim',
  'Ngô Minh Quân','Dương Thanh Bình','Lý Thị Thu','Hoàng Gia Bảo','Phan Thị Tuyết',
  'Võ Minh Khang','Đinh Thị Oanh','Trịnh Văn Hùng','Mai Quốc Cường','Cao Bảo Trâm'
]) with ordinality as t(n, i);

insert into public.profiles (id, auth_user_id, display_name, department_id)
values (pg_temp.sid(10000, 100), null, 'E2E Persona', pg_temp.sid(100, 1));

insert into public.profiles (id, auth_user_id, display_name, department_id)
select pg_temp.sid(20000, g), null, 'Sunner Liker ' || lpad(g::text, 4, '0'), null
from generate_series(1, 1000) g;

-- Kudos ---------------------------------------------------------------------
create temp table seed_kudos on commit drop as
with base as (
  select n,
    case when n between 101 and 125 then 100 else (n * 7) % 60 + 1 end as s,
    case
      when n between 126 and 150 then 100
      when n % 5 = 0 then (n / 5) % 6 + 1
      else (n * 11 + 5) % 60 + 1
    end as r0,
    case
      when n in (10, 20, 30, 40, 50) then 1000 - 20 * (n / 10 - 1)
      when n between 101 and 125 then 1
      when n between 201 and 204 then 0
      else (n * 3) % 21
    end as like_count
  from generate_series(1, 388) n
)
select n, s,
  case when r0 = s then r0 % 60 + 1 else r0 end as r,
  like_count,
  timestamptz '2025-10-30 10:00:00+07' - (n - 1) * interval '37 minutes' as created_at
from base;

insert into public.kudos (id, sender_id, receiver_id, content, images, created_at)
select pg_temp.sid(30000, n), pg_temp.sid(10000, s), pg_temp.sid(10000, r),
  (array[
    'Cảm ơn bạn đã luôn hỗ trợ team hết mình trong dự án vừa rồi!',
    'Cảm ơn sự tận tâm và tinh thần trách nhiệm tuyệt vời của bạn.',
    'Bạn đã truyền cảm hứng cho cả nhóm bằng những ý tưởng sáng tạo.',
    'Rất biết ơn vì bạn đã dành thời gian hướng dẫn mình từng bước.',
    'Làm việc cùng bạn luôn là một niềm vui, cảm ơn nhiều!',
    'Sự chủ động của bạn đã giúp chúng ta về đích đúng hạn.'
  ])[n % 6 + 1] || ' (#' || n || ')',
  case when n % 6 = 0 then '{}'::text[]
       else array_fill('/images/kudos/sample-image.png'::text, array[n % 6]) end,
  created_at
from seed_kudos;

-- Hashtags per kudos (Pioneer only on 301..312) ------------------------------
insert into public.kudos_hashtags (kudos_id, hashtag_id)
select distinct kudos_id, hashtag_id from (
  select pg_temp.sid(30000, n) as kudos_id, pg_temp.sid(200, n % 7 + 1) as hashtag_id from seed_kudos
  union all
  select pg_temp.sid(30000, n), pg_temp.sid(200, (n * 3 + 2) % 7 + 1) from seed_kudos
  union all
  select pg_temp.sid(30000, n), pg_temp.sid(200, 8) from seed_kudos where n between 301 and 312
) x;

-- Likes (hearts_awarded = 1; every seeded like is a normal day) ----------------
insert into public.kudos_likes (id, kudos_id, user_id, hearts_awarded, created_at)
select pg_temp.sid(100000, row_number() over (order by k.n, g)),
  pg_temp.sid(30000, k.n), pg_temp.sid(20000, g), 1,
  k.created_at + g * interval '1 minute'
from seed_kudos k cross join lateral generate_series(1, k.like_count) g;

-- Special day (demo; e2e manages "today" itself) ------------------------------
insert into public.special_days (day) values ('2026-11-20');

-- Gift events (list shows newest 10 of 12) ------------------------------------
insert into public.gift_events (id, profile_id, description, created_at)
select pg_temp.sid(500, i), pg_temp.sid(10000, i), d,
  timestamptz '2025-10-30 09:00:00+07' - i * interval '1 hour'
from unnest(array[
  'Nhận được 1 áo phông SAA','Nhận được 1 túi tote SAA','Nhận được 1 Secret Box','Nhận được 1 áo phông SAA',
  'Nhận được 1 bình nước SAA','Nhận được 1 Secret Box','Nhận được 1 túi tote SAA','Nhận được 1 áo phông SAA',
  'Nhận được 1 Secret Box','Nhận được 1 bình nước SAA','Nhận được 1 áo phông SAA','Nhận được 1 túi tote SAA'
]) with ordinality as t(d, i);

-- Secret boxes: persona 25 opened + 25 unopened; one Sunner with 3 unopened (RLS owner-only check)
insert into public.secret_boxes (id, profile_id, opened_at)
select pg_temp.sid(1000, g), pg_temp.sid(10000, 100),
  case when g <= 25 then timestamptz '2025-10-29 12:00:00+07' - g * interval '1 day' end
from generate_series(1, 50) g;
insert into public.secret_boxes (id, profile_id, opened_at)
select pg_temp.sid(1100, g), pg_temp.sid(10000, 1), null from generate_series(1, 3) g;

-- Invariant checks: a drifted seed FAILS `supabase db reset` ------------------
do $$
declare
  v_persona uuid := pg_temp.sid(10000, 100);
  v_top int[];
  v_next int;
  v_stats record;
  v_msg text;
begin
  if (select count(*) from public.kudos) <> 388 then raise exception 'seed: total kudos <> 388'; end if;
  if (select max(created_at) from public.kudos) <> timestamptz '2025-10-30 10:00:00+07' then
    raise exception 'seed: newest kudos created_at drifted'; end if;
  if (select count(*) from public.profiles where display_name like 'Sunner Liker %') <> 1000 then
    raise exception 'seed: liker pool <> 1000'; end if;
  if exists (select 1 from public.kudos k join public.profiles p on p.id in (k.sender_id, k.receiver_id)
             where p.display_name like 'Sunner Liker %') then
    raise exception 'seed: a liker is a sender/receiver'; end if;
  if (select count(*) from public.profiles where auth_user_id is null and display_name not like 'Sunner Liker %'
        and id <> v_persona) <> 60 then raise exception 'seed: named Sunners <> 60'; end if;

  select array_agg(like_count order by like_count desc) into v_top from public.kudos_highlights;
  if v_top <> array[1000, 980, 960, 940, 920] then raise exception 'seed: top-5 like counts drifted: %', v_top; end if;
  select max(like_count) into v_next from public.kudos_feed
    where id not in (select id from public.kudos_highlights);
  if v_next > 20 then raise exception 'seed: non-top kudos exceeds 20 likes (%)', v_next; end if;

  select * into v_stats from public.profile_kudos_stats where profile_id = v_persona;
  if (v_stats.kudos_received, v_stats.kudos_sent, v_stats.hearts_received) <> (25, 25, 25) then
    raise exception 'seed: persona stats drifted: %', v_stats; end if;
  if (select count(*) from public.secret_boxes where profile_id = v_persona and opened_at is not null) <> 25
     or (select count(*) from public.secret_boxes where profile_id = v_persona and opened_at is null) <> 25 then
    raise exception 'seed: persona secret boxes <> 25/25'; end if;
  if (select auth_user_id from public.profiles where id = v_persona) is not null then
    raise exception 'seed: persona must be unclaimed'; end if;

  if (select count(*) from public.kudos_feed where id in (select pg_temp.sid(30000, n) from generate_series(201, 204) n)
        and like_count = 0 and sender_id <> v_persona) <> 4 then
    raise exception 'seed: like-target kudos 201..204 drifted'; end if;
  if (select count(*) from public.kudos_hashtags kh join public.hashtags h on h.id = kh.hashtag_id
        where h.name = 'Pioneer') <> 12 then raise exception 'seed: Pioneer hashtag <> 12 kudos'; end if;
  if (select count(*) from public.hashtags) <> 8 then raise exception 'seed: hashtags <> 8'; end if;
  if not exists (select 1 from public.departments where code = 'CEVC10') then raise exception 'seed: CEVC10 missing'; end if;
  if not exists (select 1 from public.departments where code = 'CEVC99')
     or exists (select 1 from public.profiles p join public.departments d on d.id = p.department_id where d.code = 'CEVC99') then
    raise exception 'seed: CEVC99 must exist and be empty'; end if;
  if (select count(*) from public.gift_events) <> 12 then raise exception 'seed: gift_events <> 12'; end if;
  if (select count(*) from public.special_days) <> 1 then raise exception 'seed: special_days <> 1'; end if;
  if (select total from public.kudos_total) <> 388 then raise exception 'seed: kudos_total <> 388'; end if;
  if (select count(*) from public.kudos_feed) <> 388 then raise exception 'seed: kudos_feed row count <> 388'; end if;

  raise notice 'SEED CHECK OK: kudos=388 top5=% persona=(%/%/%) pioneer=12 likers=1000 sunners=60 boxes=25/25 gifts=12 CEVC99=empty',
    v_top, v_stats.kudos_received, v_stats.kudos_sent, v_stats.hearts_received;
end $$;
