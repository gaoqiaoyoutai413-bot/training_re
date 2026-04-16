do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'profile_account_status'
  ) then
    create type public.profile_account_status as enum ('active', 'inactive', 'retired');
  end if;
end
$$;

alter table public.profiles
add column if not exists account_status public.profile_account_status not null default 'active';

update public.profiles
set account_status = case
  when is_active = false then 'inactive'::public.profile_account_status
  else 'active'::public.profile_account_status
end
where account_status is null
   or account_status = 'active';

create index if not exists profiles_account_status_idx
  on public.profiles (account_status);
