alter table public.tasks
  add column if not exists estimated_hours integer,
  add column if not exists learning_objective text,
  add column if not exists learner_actions_json jsonb not null default '[]'::jsonb,
  add column if not exists deliverables_json jsonb not null default '[]'::jsonb,
  add column if not exists business_value_checks_json jsonb not null default '[]'::jsonb,
  add column if not exists acceptance_criteria_json jsonb not null default '{}'::jsonb,
  add column if not exists ai_review_rubric_json jsonb not null default '[]'::jsonb,
  add column if not exists mentor_evaluation_sheet_json jsonb not null default '{}'::jsonb;
