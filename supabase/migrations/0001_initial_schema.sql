create type public.user_role as enum ('student', 'mentor', 'admin');
create type public.submission_status as enum (
  'submitted',
  'ai_reviewed',
  'mentor_reviewed',
  'passed',
  'rework_requested'
);

create table if not exists public.profiles (
  id uuid primary key,
  email text not null unique,
  name text not null,
  role public.user_role not null default 'student',
  department text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.batches (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  start_date date not null,
  end_date date,
  status text not null default 'active'
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  task_code text not null,
  version integer not null default 1,
  title text not null,
  summary text not null,
  description_md text,
  category text not null,
  difficulty smallint not null check (difficulty between 1 and 4),
  automation_weight numeric not null default 0,
  ai_weight numeric not null default 0,
  integration_weight numeric not null default 0,
  review_rubric_json jsonb not null default '{}'::jsonb,
  expected_artifacts_json jsonb not null default '[]'::jsonb,
  common_failure_patterns_json jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (task_code, version)
);

create table if not exists public.task_dependencies (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  recommended_task_id uuid not null references public.tasks(id) on delete cascade,
  reason text not null
);

create table if not exists public.batch_members (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.batches(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  mentor_id uuid references public.profiles(id),
  enrolled_at timestamptz not null default now(),
  unique (batch_id, user_id)
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id),
  task_version integer not null,
  user_id uuid not null references public.profiles(id),
  batch_id uuid not null references public.batches(id),
  status public.submission_status not null default 'submitted',
  source_code_url text not null,
  business_value_text text not null,
  submitted_at timestamptz not null default now(),
  resubmission_count integer not null default 0
);

create table if not exists public.submission_files (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  storage_path text not null,
  file_type text not null,
  mime_type text,
  uploaded_at timestamptz not null default now()
);

create table if not exists public.ai_reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique references public.submissions(id) on delete cascade,
  model_name text not null,
  prompt_version text not null,
  security_score numeric,
  readability_score numeric,
  business_logic_score numeric,
  summary text,
  raw_result_json jsonb not null default '{}'::jsonb,
  reviewed_at timestamptz not null default now()
);

create table if not exists public.mentor_reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique references public.submissions(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id),
  technical_score numeric not null,
  business_score numeric not null,
  comment text not null,
  result public.submission_status not null,
  reviewed_at timestamptz not null default now()
);

create table if not exists public.knowledge_entries (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique references public.submissions(id) on delete cascade,
  published_by uuid not null references public.profiles(id),
  title text not null,
  summary text not null,
  is_public_within_org boolean not null default true,
  published_at timestamptz not null default now()
);

create index if not exists submissions_user_submitted_idx on public.submissions (user_id, submitted_at desc);
create index if not exists submissions_batch_status_idx on public.submissions (batch_id, status, submitted_at desc);
create index if not exists tasks_code_version_idx on public.tasks (task_code, version desc);
