-- F007 Viết Kudo — kudos compose columns, content_text backfill, case-insensitive hashtag uniqueness.
--
-- ROLLBACK (run after rolling back 000002..000004):
--   drop trigger if exists kudos_default_content_text on public.kudos;
--   drop function if exists public.kudos_default_content_text();
--   drop index if exists public.hashtags_name_lower_key;
--   alter table public.hashtags drop constraint if exists hashtags_name_length;
--   alter table public.kudos drop constraint if exists kudos_anonymous_name_requires_flag,
--     drop constraint if exists kudos_anonymous_name_length, drop constraint if exists kudos_content_text_length,
--     drop constraint if exists kudos_title_length;
--   alter table public.kudos drop column if exists anonymous_name, drop column if exists is_anonymous,
--     drop column if exists content_text, drop column if exists title;

alter table public.kudos
  add column title text,
  add column content_text text,
  add column is_anonymous boolean not null default false,
  add column anonymous_name text;

-- Legacy rows hold plain text in content already.
update public.kudos set content_text = content where content_text is null;

alter table public.kudos
  alter column content_text set not null,
  add constraint kudos_title_length check (char_length(title) <= 60),
  add constraint kudos_content_text_length check (char_length(content_text) <= 5000),
  add constraint kudos_anonymous_name_length check (char_length(anonymous_name) <= 30),
  add constraint kudos_anonymous_name_requires_flag check (anonymous_name is null or is_anonymous);

-- Writers that predate this migration (seed.sql, service-role scripts) only set content.
create function public.kudos_default_content_text()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.content_text is null then
    new.content_text := new.content;
  end if;
  return new;
end;
$$;

create trigger kudos_default_content_text
  before insert on public.kudos
  for each row execute function public.kudos_default_content_text();

-- Case-insensitive hashtag identity. Fail loudly if existing data would violate it.
do $$
begin
  if exists (select 1 from public.hashtags group by lower(name) having count(*) > 1) then
    raise exception 'hashtags contain case-insensitive duplicates; resolve before migrating';
  end if;
end;
$$;

alter table public.hashtags add constraint hashtags_name_length check (char_length(name) between 1 and 30);
create unique index hashtags_name_lower_key on public.hashtags (lower(name));
