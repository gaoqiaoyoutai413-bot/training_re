# アーキテクチャ設計

## 1. システム全体像

Tech-Quest は、受講生向けの学習 UI、メンター向けのレビュー UI、非同期 AI レビュー、社内向け認証とナレッジ共有を一体化した研修プラットフォームです。

```text
Google Workspace OAuth
        |
        v
 Next.js App Router
   |        |        \
   |        |         \-- Slack API
   |        |
   |        \------------ Google Drive API
   |
   v
Supabase Auth / Postgres / Storage / Edge Functions
   |
   \-------------------- Gemini API
```

## 2. レイヤ構成

### フロントエンド

- App Router によるロール別画面分離
- Server Components 中心で初期表示を高速化
- フォーム送信やレビュー更新は Server Actions または Route Handlers を利用
- 可視化は `recharts` など軽量チャートライブラリを採用

### バックエンド

- 認証: Supabase Auth + Google OAuth
- DB: PostgreSQL
- ファイル: Supabase Storage
- 非同期処理: Supabase Edge Functions + DB キュー
- 権限: RLS を前提に API ではなく DB 側でガード

### 外部連携

- Gemini API: 提出物の一次レビュー
- Slack API: 提出・レビュー完了通知
- Google Drive API: 合格済み成果物の長期保管または共有導線

## 3. 主要画面

### 受講生向け

- クエストボード
- 課題詳細
- 提出フォーム
- 自身の進捗ダッシュボード
- ナレッジライブラリ

### メンター向け

- 提出一覧
- AIレビュー結果確認
- 技術点/ビジネス点レビュー
- バッチ別進捗ダッシュボード

### 管理者向け

- 課題管理
- 課題バージョン管理
- バッチ管理
- ロール管理

## 4. ディレクトリ設計案

```text
src/
  app/
    (public)/
    (student)/
      quests/
      submissions/
      dashboard/
      knowledge/
    (mentor)/
      reviews/
      batches/
    (admin)/
      tasks/
      batches/
      users/
    api/
  components/
    quests/
    submissions/
    charts/
    reviews/
    layout/
  lib/
    auth/
    db/
    permissions/
    integrations/
    ai/
    validations/
  server/
    actions/
    queries/
  types/
supabase/
  migrations/
  functions/
docs/
```

## 5. 認証・認可方針

- Google Workspace の社内ドメインに限定
- `profiles.role` で `student`, `mentor`, `admin` を制御
- RLS で以下を担保
  - 受講生は自分の提出物のみ参照可能
  - 合格済みかつ公開対象の成果物のみ他者閲覧可
  - メンターは担当または全体提出を参照可能
  - 管理者のみ課題定義・バッチ設定を更新可能

## 6. 非同期処理設計

AIレビューと外部通知を同期処理にすると UX が不安定になりやすいため、以下の流れを推奨します。

1. 受講生が提出
2. DB に submission と review_job を作成
3. Edge Function がジョブを取得
4. Gemini で一次レビュー
5. レビュー結果を保存
6. Slack 通知
7. メンター画面に反映

## 7. ベストプラクティス方針

- UI の状態管理は URL パラメータとサーバー側データ取得を優先
- 認可は必ず RLS とサーバー側の二重防御
- 課題や依存関係はマスタデータ化し、コードに埋め込まない
- AI 出力はそのまま評価確定に使わず、一次チェックとして限定
- 集計系はトランザクションテーブル直読ではなく集計ビューへ分離
