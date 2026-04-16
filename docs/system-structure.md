# システム構成

## 1. 全体構成

Tech-Quest は `Next.js` をフロント兼サーバー API 層として使い、`Supabase` を認証・DB・Storage に利用する構成です。AI 一次レビューは `Gemini API`、通知は `Slack API`、文書出力は `Google Docs / Drive API` を利用します。

```mermaid
flowchart LR
    U[利用者<br/>student / mentor / admin]
    N[Next.js App Router]
    A[Supabase Auth]
    D[(Supabase Postgres)]
    S[(Supabase Storage)]
    G[Gemini API]
    SL[Slack API]
    GD[Google Docs / Drive API]

    U --> N
    N --> A
    N --> D
    N --> S
    N --> G
    N --> SL
    N --> GD
```

## 2. 主要フロー

### 2-1. 課題提出からレビュー返却まで

```mermaid
flowchart TD
    A[受講生が課題を選択] --> B[README とモック画像を提出]
    B --> C[submission / submission_files を保存]
    C --> D[Slack に提出通知]
    C --> E[AIレビューを実行]
    E --> F[ai_reviews を保存]
    F --> G[Slack に AIレビュー完了通知]
    G --> H[メンターが提出詳細を確認]
    H --> I[mentor_reviews を保存]
    I --> J[submissions のステータス更新]
    J --> K[Slack にメンター評価通知]
```

### 2-2. ナレッジ公開フロー

```mermaid
flowchart TD
    A[メンターが合格提出を確認] --> B[ナレッジ公開フォームを入力]
    B --> C[knowledge_entries を保存]
    C --> D[課題ごとのナレッジ一覧に反映]
    D --> E[README / コメント / モック画像を匿名公開]
```

### 2-3. Google Docs 出力フロー

```mermaid
flowchart TD
    A[管理者が管理画面で出力実行] --> B[Markdown ドキュメントを読み込み]
    B --> C[Google サービスアカウントで認証]
    C --> D[Google Docs を新規作成]
    D --> E[見出し・箇条書き付きで内容を書き込み]
    E --> F[Google Drive 上のドキュメントリンクを返却]
```

## 3. アプリケーション構成

### フロントエンド

- `app/`
  Next.js App Router の画面と API
- `components/`
  課題、提出、レビュー、ナレッジ、管理 UI 部品

### ドメイン・取得層

- `lib/`
  リポジトリ、認可、AI、Slack、Google Docs 連携
- `types/`
  ドメイン型定義

### インフラ

- `supabase/migrations/`
  DB スキーマと RLS / Storage ポリシー
- `supabase/seed/`
  初期課題データ

## 4. 主なデータ構成

現在のシステムで中心になるテーブルは以下です。

- `profiles`
  ユーザー基本情報、ロール、担当メンター
- `tasks`
  課題定義
- `submissions`
  提出本体
- `submission_files`
  モック画像などの提出ファイル
- `ai_reviews`
  AI 一次レビュー結果
- `mentor_reviews`
  メンター評価結果
- `knowledge_entries`
  ナレッジ公開データ

## 5. 認証・認可の考え方

```mermaid
flowchart LR
    U[Google ログイン]
    P[profiles.role]
    UI[画面表示制御]
    API[API 認可]
    RLS[Supabase RLS / Storage Policy]

    U --> P
    P --> UI
    P --> API
    P --> RLS
```

- ログイン後に `profiles` を同期
- 初回作成時は `student`
- 画面側でロールごとの導線を分岐
- API 側でもロールチェック
- Supabase RLS / Storage Policy で DB 側も制御

## 6. 外部連携

### Gemini API

- README を主入力として一次レビュー
- rubric ベースで要約、スコア、指摘を生成

### Slack API

- 提出登録時
- AI レビュー完了時
- メンター評価保存時

### Google Docs / Drive API

- 要件定義書出力
- 設計書出力

## 7. 現在の実装方針

- README を主提出物にする
- モック画像を必須提出物にする
- GitHub 前提ではなく、レビューしやすい文書中心の運用にする
- 良い提出は課題ごとの匿名ナレッジへ変換する
