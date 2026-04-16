drop index if exists public.submissions_batch_status_idx;

alter table public.submissions
drop column if exists batch_id;

drop table if exists public.batch_members cascade;
drop table if exists public.batches cascade;
