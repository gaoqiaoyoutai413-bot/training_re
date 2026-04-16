create or replace function public.current_user_email()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create or replace function public.current_profile_id()
returns uuid
language sql
stable
as $$
  select id
  from public.profiles
  where lower(email) = public.current_user_email()
  limit 1;
$$;

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
as $$
  select role
  from public.profiles
  where lower(email) = public.current_user_email()
  limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

create or replace function public.is_mentor_or_admin()
returns boolean
language sql
stable
as $$
  select coalesce(public.current_user_role() in ('mentor', 'admin'), false);
$$;

alter table public.profiles enable row level security;
alter table public.batches enable row level security;
alter table public.tasks enable row level security;
alter table public.task_dependencies enable row level security;
alter table public.batch_members enable row level security;
alter table public.submissions enable row level security;
alter table public.submission_files enable row level security;
alter table public.ai_reviews enable row level security;
alter table public.mentor_reviews enable row level security;
alter table public.knowledge_entries enable row level security;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles
for select
to authenticated
using (
  public.is_admin()
  or id = public.current_profile_id()
);

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin"
on public.profiles
for update
to authenticated
using (
  public.is_admin()
  or id = public.current_profile_id()
)
with check (
  public.is_admin()
  or id = public.current_profile_id()
);

drop policy if exists "batches_select_for_staff" on public.batches;
create policy "batches_select_for_staff"
on public.batches
for select
to authenticated
using (
  public.is_mentor_or_admin()
  or exists (
    select 1
    from public.batch_members bm
    where bm.batch_id = batches.id
      and bm.user_id = public.current_profile_id()
  )
);

drop policy if exists "tasks_select_authenticated" on public.tasks;
create policy "tasks_select_authenticated"
on public.tasks
for select
to authenticated
using (is_active = true or public.is_admin());

drop policy if exists "tasks_manage_admin" on public.tasks;
create policy "tasks_manage_admin"
on public.tasks
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "task_dependencies_select_authenticated" on public.task_dependencies;
create policy "task_dependencies_select_authenticated"
on public.task_dependencies
for select
to authenticated
using (true);

drop policy if exists "task_dependencies_manage_admin" on public.task_dependencies;
create policy "task_dependencies_manage_admin"
on public.task_dependencies
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "batch_members_select_self_or_staff" on public.batch_members;
create policy "batch_members_select_self_or_staff"
on public.batch_members
for select
to authenticated
using (
  public.is_mentor_or_admin()
  or user_id = public.current_profile_id()
);

drop policy if exists "batch_members_manage_admin" on public.batch_members;
create policy "batch_members_manage_admin"
on public.batch_members
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "submissions_select_owner_or_staff" on public.submissions;
create policy "submissions_select_owner_or_staff"
on public.submissions
for select
to authenticated
using (
  public.is_mentor_or_admin()
  or user_id = public.current_profile_id()
);

drop policy if exists "submissions_insert_owner" on public.submissions;
create policy "submissions_insert_owner"
on public.submissions
for insert
to authenticated
with check (
  user_id = public.current_profile_id()
  or public.is_admin()
);

drop policy if exists "submissions_update_owner_or_staff" on public.submissions;
create policy "submissions_update_owner_or_staff"
on public.submissions
for update
to authenticated
using (
  public.is_mentor_or_admin()
  or user_id = public.current_profile_id()
)
with check (
  public.is_mentor_or_admin()
  or user_id = public.current_profile_id()
);

drop policy if exists "submission_files_select_owner_or_staff" on public.submission_files;
create policy "submission_files_select_owner_or_staff"
on public.submission_files
for select
to authenticated
using (
  exists (
    select 1
    from public.submissions s
    where s.id = submission_files.submission_id
      and (
        s.user_id = public.current_profile_id()
        or public.is_mentor_or_admin()
      )
  )
);

drop policy if exists "submission_files_insert_owner_or_staff" on public.submission_files;
create policy "submission_files_insert_owner_or_staff"
on public.submission_files
for insert
to authenticated
with check (
  exists (
    select 1
    from public.submissions s
    where s.id = submission_files.submission_id
      and (
        s.user_id = public.current_profile_id()
        or public.is_mentor_or_admin()
      )
  )
);

drop policy if exists "ai_reviews_select_owner_or_staff" on public.ai_reviews;
create policy "ai_reviews_select_owner_or_staff"
on public.ai_reviews
for select
to authenticated
using (
  exists (
    select 1
    from public.submissions s
    where s.id = ai_reviews.submission_id
      and (
        s.user_id = public.current_profile_id()
        or public.is_mentor_or_admin()
      )
  )
);

drop policy if exists "ai_reviews_manage_staff" on public.ai_reviews;
create policy "ai_reviews_manage_staff"
on public.ai_reviews
for all
to authenticated
using (public.is_mentor_or_admin() or public.is_admin())
with check (public.is_mentor_or_admin() or public.is_admin());

drop policy if exists "mentor_reviews_select_owner_or_staff" on public.mentor_reviews;
create policy "mentor_reviews_select_owner_or_staff"
on public.mentor_reviews
for select
to authenticated
using (
  exists (
    select 1
    from public.submissions s
    where s.id = mentor_reviews.submission_id
      and (
        s.user_id = public.current_profile_id()
        or public.is_mentor_or_admin()
      )
  )
);

drop policy if exists "mentor_reviews_manage_staff" on public.mentor_reviews;
create policy "mentor_reviews_manage_staff"
on public.mentor_reviews
for all
to authenticated
using (public.is_mentor_or_admin())
with check (public.is_mentor_or_admin());

drop policy if exists "knowledge_entries_select_authenticated" on public.knowledge_entries;
create policy "knowledge_entries_select_authenticated"
on public.knowledge_entries
for select
to authenticated
using (is_public_within_org = true or public.is_admin());

drop policy if exists "knowledge_entries_manage_admin" on public.knowledge_entries;
create policy "knowledge_entries_manage_admin"
on public.knowledge_entries
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
