# Tech-Quest 設計書

## 1. システム構成

### 1-1. 全体構成

- フロントエンド: Next.js App Router
- 認証 / DB / Storage: Supabase
- AI 一次レビュー: Gemini API
- 通知: Slack API

### 1-2. 構成イメージ

```text
Google Workspace OAuth
        |
        v
 Next.js App Router
   |        |        \
   |        |         \-- Slack API
   |        |
   |        \------------ Gemini API
   |
   v
Supabase Auth / Postgres / Storage
```

## 2. 認証・認可設計

### 2-1. ロール

- student
- mentor
- admin

### 2-2. 方針

- Google Workspace ログイン
- 初回ログイン時は `student`
- `profiles.role` でロール管理
- API 側でもロールチェック
- RLS で DB 側も保護

## 3. データモデル設計

### 3-1. profiles

- ユーザー基本情報
- ロール
- 受講生単位の担当メンター `assigned_mentor_id`

### 3-2. tasks

- 課題定義
- 合格条件
- AI レビュー rubric
- メンター評価シート

### 3-3. submissions

- 課題提出
- README 本文
- 補足リンク
- 提出ステータス
- 担当メンター

### 3-4. submission_files

- モック画像
- 補足ファイル
- Storage パス

### 3-5. ai_reviews

- スコア
- 要約
- 指摘
- 合格条件チェック

### 3-6. mentor_reviews

- 技術点
- ビジネス点
- コメント
- 判定

### 3-7. knowledge_entries

- 公開対象提出
- 公開タイトル
- 要約
- ハイライト
- 公開日時

## 4. 主要画面設計

### 4-1. 提出画面

- README 必須
- モック画像必須
- 補足リンクは任意
- GitHub は必須にしない

### 4-2. 提出詳細

- README を主表示
- モック画像を右レールで確認
- AI レビューとメンター評価を同画面確認

### 4-3. 担当設定

- 受講生単位で担当メンターを設定
- mentor は自分を担当にできる
- admin は任意メンターを選択できる

### 4-4. ナレッジ一覧

- 課題ごとに公開ナレッジを集約
- 提出者名は出さない
- README / メンターコメント / モック画像が見られることを示す

### 4-5. ナレッジ詳細

- README 要約
- README 本文
- メンターコメント
- モック画像
- 提出リンク

## 5. 提出フロー設計

1. 受講生が課題を選択
2. README とモック画像を提出
3. `submissions` に保存
4. モック画像を Storage に保存
5. Slack 通知
6. AI 一次レビュー実行
7. メンター評価
8. 合格ならナレッジ公開候補

## 6. AI レビュー設計

### 6-1. 入力

- README 本文
- 課題の合格条件
- AI レビュー rubric
- 必要に応じて補足リンクや添付情報

### 6-2. 出力

- セキュリティスコア
- 可読性スコア
- ビジネス価値スコア
- 要約
- 指摘一覧
- メンター確認ポイント
- 合格条件チェック

## 7. ナレッジ公開設計

### 7-1. 公開条件

- 提出が `passed`
- mentor または admin が公開

### 7-2. 公開内容

- タイトル
- 要約
- ハイライト
- README 本文
- メンターコメント
- モック画像

### 7-3. 非公開内容

- 提出者名
- 個人特定情報

## 8. 通知設計

- 提出完了で Slack 通知
- AI レビュー完了で Slack 通知
- メンター評価保存で Slack 通知

## 9. API 設計要点

- `/api/submissions`
  - README + モック画像の提出保存
- `/api/reviews`
  - レビュー一覧 / レビュー保存
- `/api/assignments`
  - 担当設定一覧 / 更新
- `/api/knowledge`
  - ナレッジ一覧 / 公開

## 10. Google Docs 運用

今回のリポジトリでは、まず Google Docs に貼り付けやすい Markdown 版として以下を整備する。

- `docs/google-docs-requirements-spec.md`
- `docs/google-docs-design-spec.md`

今後の拡張として、Google Docs API により以下も可能。

- 文書テンプレートから自動生成
- 指定フォルダへの自動保存
- 更新時の差し替え
