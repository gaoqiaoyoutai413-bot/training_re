# セットアップ手順

## 1. 依存インストール

```bash
npm install
```

## 2. 環境変数

`.env.example` を元に `.env.local` を作成し、以下を設定します。

- Supabase URL / Anon Key / Service Role Key
- Gemini API Key
- Slack Bot Token
- Google Drive Folder ID
- 社内 Google Workspace ドメイン

## 3. ローカル起動

```bash
npm run dev
```

## 4. Supabase 初期化

- `supabase/migrations/0001_initial_schema.sql` を適用
- Google OAuth を Supabase Auth に設定
- 社内ドメイン制限を導入
- Storage バケットを `submission-evidence` などで作成

## 5. ここから本番実装で差し替える箇所

- `lib/mock-data.ts` を Supabase Query に置換
- `app/api/*` を RLS 前提の実データ取得へ変更
- `app/api/jobs/ai-review/run/route.ts` を Edge Function 起動へ変更
- `app/api/submissions/route.ts` を Storage アップロードと review_job 作成へ拡張
- Slack / Google Drive 連携を `lib/integrations` 配下へ追加
