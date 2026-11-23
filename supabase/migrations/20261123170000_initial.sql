-- Mathutando MVP schema: public library, user-owned content, basic community.
-- Run in a fresh Supabase project. Do NOT migrate the old Railway database here.
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Mathutando' check (char_length(display_name) between 1 and 80),
  created_at timestamptz not null default now()
);

-- The user does not control a 'verified' flag. Verification is a separate protected entity.
create table public.teacher_verifications (
  user_id uuid primary key references auth.users(id) on delete cascade,
  institution text not null,
  professional_email text not null,
  subject_area text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','revoked')),
  verified_at timestamptz,
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.topics(id) on delete restrict,
  school_year int check (school_year between 1 and 12),
  slug text not null unique,
  name text not null check (char_length(name) between 1 and 120),
  sort_order int not null default 0
);
create index topics_parent_idx on public.topics(parent_id);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete set null,
  topic_id uuid not null references public.topics(id) on delete restrict,
  title text not null check (char_length(title) between 5 and 160),
  summary text not null default '' check (char_length(summary) <= 800),
  author_difficulty int not null default 3 check (author_difficulty between 1 and 5),
  status text not null default 'draft' check (status in ('draft','published','hidden')),
  current_version int not null default 1 check (current_version > 0),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index exercises_published_idx on public.exercises(published_at desc) where status='published';
create index exercises_topic_idx on public.exercises(topic_id) where status='published';
create index exercises_author_idx on public.exercises(author_id);

-- Public JSON contains ONLY the learner-facing prompt and content. No answer keys.
create table public.exercise_versions (
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  version_number int not null check (version_number > 0),
  definition jsonb not null check (
    jsonb_typeof(definition) = 'object' and definition->>'schemaVersion' = '1'
    and jsonb_typeof(definition->'steps') = 'array'
  ),
  created_at timestamptz not null default now(),
  primary key (exercise_id, version_number)
);

-- Never exposed to anon/authenticated roles: for a future secure evaluation service.
create table public.exercise_answer_keys (
  exercise_id uuid not null,
  version_number int not null,
  answer_key jsonb not null,
  primary key (exercise_id, version_number),
  foreign key (exercise_id, version_number) references public.exercise_versions(exercise_id, version_number) on delete cascade
);

create table public.exercise_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null,
  version_number int not null,
  started_at timestamptz not null default now(),
  foreign key (exercise_id, version_number) references public.exercise_versions(exercise_id, version_number)
);
create index exercise_attempts_owner_idx on public.exercise_attempts(user_id,started_at desc);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  status text not null default 'published' check (status in ('published','hidden')),
  created_at timestamptz not null default now()
);
create index posts_feed_idx on public.posts(created_at desc) where status='published';

create table public.exercise_comments (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index exercise_comments_exercise_idx on public.exercise_comments(exercise_id,created_at desc);

create table public.difficulty_ratings (
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  difficulty int not null check (difficulty between 1 and 5),
  created_at timestamptz not null default now(),
  primary key (exercise_id,user_id)
);

create table public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid references public.exercises(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  comment_id uuid references public.exercise_comments(id) on delete cascade,
  reason text not null check (char_length(reason) between 5 and 500),
  status text not null default 'pending' check (status in ('pending','reviewed','dismissed')),
  created_at timestamptz not null default now(),
  check (num_nonnulls(exercise_id,post_id,comment_id)=1)
);

-- Build a public profile after email verification / signup; never put emails in public profiles.
create function public.create_profile_after_signup()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id,display_name) values (new.id,'Aluno de matemática') on conflict do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.create_profile_after_signup();

-- All client-facing tables have RLS explicitly enabled.
alter table public.profiles enable row level security;
alter table public.teacher_verifications enable row level security;
alter table public.topics enable row level security;
alter table public.exercises enable row level security;
alter table public.exercise_versions enable row level security;
alter table public.exercise_answer_keys enable row level security;
alter table public.exercise_attempts enable row level security;
alter table public.posts enable row level security;
alter table public.exercise_comments enable row level security;
alter table public.difficulty_ratings enable row level security;
alter table public.content_reports enable row level security;

-- Explicit table grants; no browser privileges on private answer keys or verification decisions.
revoke all on all tables in schema public from anon, authenticated;
grant select on public.topics,public.profiles to anon,authenticated;
grant select,insert,update on public.exercises to authenticated;
grant select on public.exercises to anon;
grant select,insert on public.exercise_versions to authenticated;
grant select on public.exercise_versions to anon;
grant select,insert on public.posts,public.exercise_comments to authenticated;
grant select on public.posts,public.exercise_comments to anon;
grant select,insert,update on public.difficulty_ratings to authenticated;
grant select on public.difficulty_ratings to anon;
grant select,insert on public.content_reports,public.exercise_attempts to authenticated;
grant update(display_name) on public.profiles to authenticated;

create policy profiles_read on public.profiles for select to anon,authenticated using (true);
create policy profiles_update_self on public.profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);
create policy topics_read on public.topics for select to anon,authenticated using (true);

create policy exercises_read on public.exercises for select to anon,authenticated
using (status='published' or (select auth.uid())=author_id);
create policy exercises_create_draft on public.exercises for insert to authenticated
with check (author_id=(select auth.uid()) and status='draft');
create policy exercises_update_draft on public.exercises for update to authenticated
using (author_id=(select auth.uid()) and status='draft')
with check (author_id=(select auth.uid()) and status='draft');

create policy exercise_versions_read on public.exercise_versions for select to anon,authenticated
using (exists (select 1 from public.exercises e where e.id=exercise_id
  and ((e.status='published' and e.current_version=version_number) or e.author_id=(select auth.uid()))));
create policy exercise_versions_author_draft on public.exercise_versions for insert to authenticated
with check (exists (select 1 from public.exercises e where e.id=exercise_id and e.status='draft' and e.author_id=(select auth.uid())));

create policy exercise_attempts_read_self on public.exercise_attempts for select to authenticated using (user_id=(select auth.uid()));
create policy exercise_attempts_start on public.exercise_attempts for insert to authenticated with check (
 user_id=(select auth.uid()) and exists(select 1 from public.exercises e where e.id=exercise_id and e.status='published' and e.current_version=version_number)
);

create policy posts_read on public.posts for select to anon,authenticated using (
 status='published' and exists(select 1 from public.exercises e where e.id=exercise_id and e.status='published')
);
create policy posts_create on public.posts for insert to authenticated with check (
 author_id=(select auth.uid()) and status='published' and exists(select 1 from public.exercises e where e.id=exercise_id and e.status='published')
);

create policy comments_read on public.exercise_comments for select to anon,authenticated using (
 not is_hidden and exists(select 1 from public.exercises e where e.id=exercise_id and e.status='published')
);
create policy comments_create on public.exercise_comments for insert to authenticated with check (
 author_id=(select auth.uid()) and not is_hidden and exists(select 1 from public.exercises e where e.id=exercise_id and e.status='published')
);

create policy ratings_read on public.difficulty_ratings for select to anon,authenticated using (
 exists(select 1 from public.exercises e where e.id=exercise_id and e.status='published')
);
create policy ratings_create on public.difficulty_ratings for insert to authenticated with check (
 user_id=(select auth.uid()) and exists(select 1 from public.exercises e where e.id=exercise_id and e.status='published')
);
create policy ratings_update on public.difficulty_ratings for update to authenticated
using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));

create policy reports_create on public.content_reports for insert to authenticated with check (reporter_id=(select auth.uid()) and status='pending');
create policy reports_read_self on public.content_reports for select to authenticated using (reporter_id=(select auth.uid()));

-- A secure controlled publish transition; clients cannot directly set the status.
create function public.publish_exercise(p_exercise_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare n int;
begin
  if (select auth.uid()) is null then raise exception 'Login obrigatório'; end if;
  select count(*) into n from public.exercises e
  join public.exercise_versions v on v.exercise_id=e.id and v.version_number=e.current_version
  where e.id=p_exercise_id and e.author_id=(select auth.uid()) and e.status='draft'
    and jsonb_array_length(v.definition->'steps') between 1 and 30;
  if n<>1 then raise exception 'Rascunho inválido ou sem permissão'; end if;
  update public.exercises set status='published',published_at=now(),updated_at=now()
  where id=p_exercise_id and author_id=(select auth.uid()) and status='draft';
end;
$$;
revoke all on function public.publish_exercise(uuid) from public,anon;
grant execute on function public.publish_exercise(uuid) to authenticated;

comment on table public.exercise_answer_keys is 'Private evaluation configuration; never grant to anon/authenticated';
comment on column public.exercise_versions.definition is 'Public prompt ONLY; never store correct answers here';
