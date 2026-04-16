alter table public.knowledge_entries
add column if not exists highlights_json jsonb not null default '[]'::jsonb;
