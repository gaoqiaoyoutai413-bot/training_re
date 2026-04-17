# 最終運用ポリシー 実装反映チェック

## 1. 目的

この文書は、[最終運用ポリシー](./final-operational-policy.md) に対して、

- すでに実装済みの項目
- 一部実装済みの項目
- まだ未実装の項目

を整理し、次にどこから本番向け実装を進めるべきかを明確にするためのチェックシートです。

## 2. 反映状況サマリー

| 項目 | 状態 | 補足 |
| --- | --- | --- |
| Step1 提出ルール | 実装済み | README 必須、モック画像必須、補足リンク任意 |
| Step2 AIレビューは参考情報 | 実装済み | AI は参考情報、最終判定は mentor である旨を UI に表示 |
| Step3 ナレッジ公開ルール | 実装済み | passed のみ、mentor/admin 公開、匿名表示 |
| Step4 メンター担当ルール | 実装済み | 人単位、mentor 自己設定、admin 上書き |
| Step5 Slack通知ルール | 実装済み | チャンネル通知と student DM 通知を実装、外部 Supabase の `members.email -> slack_id` 参照あり |
| Step6 管理者運用ルール | 実装済み | admin 管理、初回 student、mentor 昇格は admin |
| Step7 Google Docs 出力ルール | 実装済み | 要件定義書 / 設計書 / 社内説明用サマリーを admin が出力可能 |
| Step8 データ保持ルール | 一部実装済み | inactive / retired の利用状態管理は実装済み、物理削除は admin 個別対応のまま |
| Step10-19 Google Drive 退避ルール | 実装済み | passed 時自動退避、failed 保持、admin 再実行、詳細画面表示まで実装 |

## 3. 項目別チェック

### 3-1. Step1 提出ルール

**方針**

- README 必須
- モック画像必須
- 補足リンク任意

**現状**

- [app/api/submissions/route.ts](../app/api/submissions/route.ts)
  で README 必須、モック画像必須をバリデーション済み
- [components/submission-form.tsx](../components/submission-form.tsx)
  で README とモック画像中心のフォームになっている

**状態**

- 実装済み

### 3-2. Step2 AIレビューの位置づけ

**方針**

- AIレビューは参考情報
- 最終判定は mentor

**現状**

- [app/api/jobs/ai-review/run/route.ts](../app/api/jobs/ai-review/run/route.ts)
  で AIレビュー実行は可能
- [app/api/reviews/route.ts](../app/api/reviews/route.ts)
  で最終判定は mentor/admin が保存する構成
- [components/ai-review-panel.tsx](../components/ai-review-panel.tsx)
  と [components/mentor-review-form.tsx](../components/mentor-review-form.tsx)
  で「AI は参考情報、最終判定は mentor」である旨を表示

**状態**

- 実装済み

### 3-3. Step3 ナレッジ公開ルール

**方針**

- `passed` の提出のみ
- `mentor` または `admin` が公開
- `README / メンターコメント / モック画像` を匿名公開

**現状**

- [app/api/knowledge/route.ts](../app/api/knowledge/route.ts)
  で `passed` のみ公開可能
- mentor/admin のみ POST 可
- [app/knowledge/page.tsx](../app/knowledge/page.tsx) と [app/knowledge/[taskCode]/page.tsx](../app/knowledge/[taskCode]/page.tsx)
  で匿名公開

**状態**

- 実装済み

### 3-4. Step4 メンター担当ルール

**方針**

- 人単位
- mentor は自分を担当に設定 / 解除可能
- admin は任意 mentor を設定 / 解除可能

**現状**

- [app/api/assignments/route.ts](../app/api/assignments/route.ts)
  で人単位の担当設定を実装
- `profiles.assigned_mentor_id` を更新し、提出にも反映

**状態**

- 実装済み

### 3-5. Step5 Slack通知ルール

**方針**

- レビュー用チャンネル
  - 提出
  - AIレビュー完了
  - 合格
  - 差し戻し
- student DM
  - メンター評価完了
  - 合格
  - 差し戻し

**現状**

- [lib/slack-notify.ts](../lib/slack-notify.ts)
  でチャンネル通知と DM 通知を実装
- [lib/member-directory.ts](../lib/member-directory.ts)
  で外部 Supabase の `members.email -> slack_id` を参照
- 提出、AIレビュー完了、メンター評価保存時の通知は入っている
- メンター評価保存時は student への DM も送る
- 合格 / 差し戻しはメンター評価結果に含めて通知する

**状態**

- 実装済み

**補足**

- DM 宛先は外部 Supabase の `public.members` から `email -> slack_id` を解決
- Slack App 側では `chat:write` と DM 用 scope が必要

### 3-6. Step6 管理者運用ルール

**方針**

- admin は運営責任者のみ
- 課題編集、ロール変更、担当設定上書き、Google Docs 出力、ナレッジ管理
- mentor 昇格は admin
- 初回ログインは student

**現状**

- [app/api/auth/profile/route.ts](../app/api/auth/profile/route.ts)
  で初回 student 作成
- 課題編集、ロール変更、担当設定、Docs 出力は admin 中心の構成

**状態**

- 実装済み

### 3-7. Step7 Google Docs 出力ルール

**方針**

- 社内共有用の整形版
- 原本はシステム内データ + repo docs
- admin のみ
- 要件定義書 / 設計書 / 社内説明用サマリー

**現状**

- [app/api/docs/google-export/route.ts](../app/api/docs/google-export/route.ts)
  は admin のみ
- 要件定義書、設計書、社内説明用サマリーの出力を実装済み
- [components/google-docs-export-card.tsx](../components/google-docs-export-card.tsx)
  に 3 本の出力ボタンを配置

**状態**

- 実装済み

### 3-8. Step8 データ保持ルール

**方針**

- README / モック画像 / AIレビュー / メンター評価は保持
- ナレッジ公開物は匿名化して継続利用
- 退職後はログイン不可、履歴は内部保持
- 削除は admin 判断で個別対応

**現状**

- データ自体は保持前提で保存されている
- ナレッジは匿名表示
- [supabase/migrations/0010_add_profile_account_status.sql](../supabase/migrations/0010_add_profile_account_status.sql)
  で `profiles.account_status` を追加
- [app/admin/learners/page.tsx](../app/admin/learners/page.tsx)
  で `active / inactive / retired` を管理できる
- inactive / retired のユーザーはログイン不可

**状態**

- 一部実装済み

**残作業**

- 物理削除や個別削除依頼対応の UI は未実装
- 削除対応は引き続き admin の個別判断

### 3-9. Step10-19 Google Drive 退避ルール

**方針**

- 合格提出のみ Google Drive へ退避
- 退避対象は `README / モック画像 / コードファイル`
- フォルダ構成は `大元 / 課題コード_課題名 / 氏名_日付`
- `failed` 時はエラー保持と Slack 通知
- `admin` が再実行可能

**現状**

- [supabase/migrations/0013_add_submission_drive_export_fields.sql](../supabase/migrations/0013_add_submission_drive_export_fields.sql)
  で Drive 退避管理項目を追加
- [lib/google-drive-archive.ts](../lib/google-drive-archive.ts)
  で Service Account による Google Drive 退避を実装
- [app/api/reviews/route.ts](../app/api/reviews/route.ts)
  で `passed` 時の自動退避を実装
- [app/api/submissions/[id]/drive-export/route.ts](../app/api/submissions/%5Bid%5D/drive-export/route.ts)
  で admin 再実行 API を実装
- [components/drive-export-card.tsx](../components/drive-export-card.tsx)
  と詳細画面で Drive 退避状態を表示
- [lib/slack-notify.ts](../lib/slack-notify.ts)
  で退避失敗通知を追加

**状態**

- 実装済み

## 4. 次に着手すべき優先順

### 優先度高

1. 合格 / 差し戻しイベント通知の文面調整
2. inactive / retired 運用の社内周知
3. Google Docs 出力の体裁微調整

### 優先度中

4. 削除依頼対応フローの UI 設計
5. ナレッジ公開フローの運用文言整備

### 優先度低

6. 管理画面上への運用ポリシー表示
7. 画面ごとの説明文の最終調整

## 5. 実装開始のおすすめ

本番化に向けて、次の順で進めるのがおすすめです。

1. 合格 / 差し戻し通知の最終文面調整
2. 削除依頼対応フローの設計
3. ナレッジ公開まわりの運用ガイド整備
