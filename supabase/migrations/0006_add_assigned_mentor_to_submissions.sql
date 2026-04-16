alter table public.submissions
add column if not exists assigned_mentor_id uuid references public.profiles(id);

update public.submissions s
set assigned_mentor_id = bm.mentor_id
from public.batch_members bm
where s.assigned_mentor_id is null
  and s.batch_id = bm.batch_id
  and s.user_id = bm.user_id
  and bm.mentor_id is not null;

create index if not exists submissions_assigned_mentor_idx
  on public.submissions (assigned_mentor_id, submitted_at desc);
