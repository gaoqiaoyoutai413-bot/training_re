# データモデル設計

## 1. 主要エンティティ

### profiles

- `id` UUID PK
- `email` text unique
- `name` text
- `role` text check in (`student`, `mentor`, `admin`)
- `department` text
- `joined_at` timestamptz
- `is_active` boolean

### batches

- `id` UUID PK
- `code` text unique
- `name` text
- `start_date` date
- `end_date` date
- `status` text

### batch_members

- `id` UUID PK
- `batch_id` UUID FK
- `user_id` UUID FK
- `mentor_id` UUID FK nullable
- `enrolled_at` timestamptz

### task_categories

- `id` UUID PK
- `slug` text unique
- `name` text

### tasks

- `id` UUID PK
- `task_code` text
- `version` integer
- `title` text
- `summary` text
- `description_md` text
- `difficulty` smallint
- `category_id` UUID FK
- `business_impact_weight` numeric
- `automation_weight` numeric
- `ai_weight` numeric
- `integration_weight` numeric
- `is_active` boolean
- `published_at` timestamptz

### task_dependencies

- `id` UUID PK
- `task_id` UUID FK
- `recommended_task_id` UUID FK
- `dependency_type` text
- `note` text

### submissions

- `id` UUID PK
- `task_id` UUID FK
- `task_version` integer
- `user_id` UUID FK
- `batch_id` UUID FK
- `status` text check in (`submitted`, `ai_reviewed`, `mentor_reviewed`, `passed`, `rework_requested`)
- `source_code_url` text
- `business_value_text` text
- `submitted_at` timestamptz
- `resubmission_count` integer

### submission_files

- `id` UUID PK
- `submission_id` UUID FK
- `storage_path` text
- `file_type` text
- `mime_type` text
- `uploaded_at` timestamptz

### ai_reviews

- `id` UUID PK
- `submission_id` UUID FK unique
- `model_name` text
- `prompt_version` text
- `security_score` numeric
- `readability_score` numeric
- `business_logic_score` numeric
- `summary` text
- `raw_result_json` jsonb
- `reviewed_at` timestamptz

### mentor_reviews

- `id` UUID PK
- `submission_id` UUID FK unique
- `reviewer_id` UUID FK
- `technical_score` numeric
- `business_score` numeric
- `comment` text
- `result` text check in (`passed`, `rework_requested`)
- `reviewed_at` timestamptz

### knowledge_entries

- `id` UUID PK
- `submission_id` UUID FK unique
- `published_by` UUID FK
- `title` text
- `summary` text
- `is_public_within_org` boolean
- `published_at` timestamptz

### notification_events

- `id` UUID PK
- `event_type` text
- `target_user_id` UUID FK nullable
- `payload` jsonb
- `delivered_at` timestamptz nullable

## 2. ER 図相当

```text
profiles 1---* batch_members *---1 batches
profiles 1---* submissions *---1 tasks
tasks 1---* task_dependencies
tasks 1---* submissions
submissions 1---* submission_files
submissions 1---1 ai_reviews
submissions 1---1 mentor_reviews
submissions 1---0..1 knowledge_entries
profiles 1---* mentor_reviews
```

## 3. 設計上のポイント

### 課題バージョン管理

- `tasks.task_code` で論理的な同一課題を表現
- `version` を持たせて改訂に対応
- 提出時に `task_version` を保存し、後から課題定義が変わっても監査可能

### レーダーチャート算出

- `tasks` にスキル重みを保持
- 合格済み提出に対して重みを集計
- 受講生別のスキルスコアは View または Materialized View 化

### ナレッジ公開制御

- `mentor_reviews.result = 'passed'` のみ公開候補
- `knowledge_entries` を明示作成したものだけライブラリに出す

## 4. 推奨インデックス

- `submissions (user_id, submitted_at desc)`
- `submissions (batch_id, status, submitted_at desc)`
- `submissions (task_id, user_id)`
- `mentor_reviews (reviewer_id, reviewed_at desc)`
- `tasks (task_code, version desc)`
- `knowledge_entries (published_at desc)`
- `ai_reviews using gin (raw_result_json)`

## 5. RLS の考え方

### 受講生

- 自分の `submissions` のみ参照可
- `knowledge_entries` は公開済みのみ参照可
- 他者の未合格 `submissions` は不可

### メンター

- 自身の担当バッチまたはレビュー権限のある提出を参照可
- `mentor_reviews` を作成・更新可

### 管理者

- 全テーブル参照・更新可
