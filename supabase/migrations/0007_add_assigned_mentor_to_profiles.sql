alter table public.profiles
add column if not exists assigned_mentor_id uuid references public.profiles(id);

update public.profiles p
set assigned_mentor_id = bm.mentor_id
from public.batch_members bm
where p.id = bm.user_id
  and p.assigned_mentor_id is null
  and bm.mentor_id is not null;

create index if not exists profiles_assigned_mentor_idx
  on public.profiles (assigned_mentor_id);
