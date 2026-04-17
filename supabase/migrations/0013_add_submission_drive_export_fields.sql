alter table public.submissions
  add column if not exists drive_folder_id text,
  add column if not exists drive_export_status text check (drive_export_status in ('pending', 'exported', 'failed')),
  add column if not exists drive_exported_at timestamptz,
  add column if not exists drive_export_error text;

update public.submissions
set
  drive_export_status = coalesce(drive_export_status, 'pending')
where status = 'passed' and drive_export_status is null;
