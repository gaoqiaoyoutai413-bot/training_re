create or replace function public.storage_submission_id(object_name text)
returns uuid
language sql
stable
as $$
  select case
    when split_part(object_name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      then split_part(object_name, '/', 1)::uuid
    else null
  end;
$$;

create or replace function public.can_access_submission_storage(object_name text)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.submissions s
    where s.id = public.storage_submission_id(object_name)
      and (
        s.user_id = public.current_profile_id()
        or public.is_mentor_or_admin()
      )
  );
$$;

drop policy if exists "submission_evidence_select_owner_or_staff" on storage.objects;
create policy "submission_evidence_select_owner_or_staff"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'submission-evidence'
  and public.can_access_submission_storage(name)
);

drop policy if exists "submission_evidence_insert_owner_or_staff" on storage.objects;
create policy "submission_evidence_insert_owner_or_staff"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'submission-evidence'
  and public.can_access_submission_storage(name)
);

drop policy if exists "submission_evidence_update_owner_or_staff" on storage.objects;
create policy "submission_evidence_update_owner_or_staff"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'submission-evidence'
  and public.can_access_submission_storage(name)
)
with check (
  bucket_id = 'submission-evidence'
  and public.can_access_submission_storage(name)
);

drop policy if exists "submission_evidence_delete_owner_or_staff" on storage.objects;
create policy "submission_evidence_delete_owner_or_staff"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'submission-evidence'
  and (
    public.is_mentor_or_admin()
    or exists (
      select 1
      from public.submissions s
      where s.id = public.storage_submission_id(name)
        and s.user_id = public.current_profile_id()
    )
  )
);
