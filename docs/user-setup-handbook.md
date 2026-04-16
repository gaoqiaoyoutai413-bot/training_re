# 本番化に向けたユーザー作業手順書

この手順書は、Tech-Quest をモック状態から本番接続可能な状態へ進めるために、ユーザー側で実施していただきたい作業を細かくまとめたものです。

対象読者:

- Supabase の初期設定を担当する方
- Google OAuth の設定を担当する方
- ローカルで接続確認を行う方

この手順書で扱う範囲:

- Supabase プロジェクト作成
- DB スキーマ反映
- 課題マスタ投入
- Google OAuth 設定
- Storage 作成
- ローカル接続確認

この手順書でまだ扱わない範囲:

- 本番 RLS ポリシーの詳細設計
- Slack API / Gemini API / Google Drive API の実装接続
- 提出機能・レビュー機能の完全本番化

## 0. 事前に用意しておくもの

作業前に、以下を用意してください。

- Supabase アカウント
- Google Cloud Console にアクセスできる権限
- Google Workspace の対象ドメイン名
- このリポジトリを開けるローカル環境
- Node.js と npm

推奨確認コマンド:

```bash
node -v
npm -v
```

期待すること:

- `node` が実行できる
- `npm` が実行できる

## 1. Supabase プロジェクトを作成する

### 1-1. Supabase にログインする

- Supabase ダッシュボードを開く
- `New project` を押す

### 1-2. 新規プロジェクトを作る

入力する主な項目:

- Organization
- Project name
  例: `tech-quest-prod` または `tech-quest-dev`
- Database Password
  強いパスワードを設定して必ず控える
- Region
  利用ユーザーに近いリージョンを選ぶ

### 1-3. 作成後に控える値

Supabase ダッシュボードで以下を控えてください。

取得場所:
- `Project Settings`
- `API`

控える値:

- `Project URL`
- `anon public key`
- `service_role key`

注意:

- `service_role key` は強い権限を持つため、公開しないでください
- GitHub やチャットにそのまま貼らないでください

## 2. ローカル環境の `.env.local` を作成する

### 2-1. 雛形ファイルを確認する

参照ファイル:

- [.env.example](/Users/yuta/vexum/internal%20system/training/.env.example)

### 2-2. `.env.local` を作る

プロジェクトルートに `.env.local` を作成してください。

設定例:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_WORKSPACE_DOMAIN=example.com
GEMINI_API_KEY=
SLACK_BOT_TOKEN=
SLACK_REVIEW_CHANNEL=
GOOGLE_DRIVE_FOLDER_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=
```

### 2-3. 今の段階で必須のもの

最小限、今すぐ必要なのは以下です。

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_WORKSPACE_DOMAIN`

以下は後で空でも可です。

- `GEMINI_API_KEY`
- `SLACK_BOT_TOKEN`
- `SLACK_REVIEW_CHANNEL`
- `GOOGLE_DRIVE_FOLDER_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`

### 2-4. `.env.local` 作成時の注意

- `.env.local` は Git にコミットしないでください
- 値の前後に不要な空白を入れないでください
- URL の末尾に `/` を付けないでください

補足:

- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` は改行を `\n` として 1 行で保存してください

## 3. DB スキーマを Supabase に反映する

### 3-1. SQL Editor を開く

- Supabase ダッシュボードを開く
- 左メニューの `SQL Editor` を開く
- `New query` を押す

### 3-2. 初期スキーマを流す

対象ファイル:

- [supabase/migrations/0001_initial_schema.sql](/Users/yuta/vexum/internal%20system/training/supabase/migrations/0001_initial_schema.sql)

やること:

- ファイル内容をコピーする
- SQL Editor に貼り付ける
- `Run` を押す

成功確認:

- エラーが出ない
- `public.tasks`
- `public.submissions`
- `public.ai_reviews`
- `public.mentor_reviews`

などのテーブルができている

### 3-3. 課題マスタ拡張スキーマを流す

対象ファイル:

- [supabase/migrations/0002_expand_task_catalog.sql](/Users/yuta/vexum/internal%20system/training/supabase/migrations/0002_expand_task_catalog.sql)

やること:

- 同様に内容を SQL Editor へ貼る
- `Run` を押す

成功確認:

- `public.tasks` に以下の列が追加されている

主な確認列:

- `estimated_hours`
- `learning_objective`
- `learner_actions_json`
- `deliverables_json`
- `business_value_checks_json`
- `acceptance_criteria_json`
- `ai_review_rubric_json`
- `mentor_evaluation_sheet_json`

### 3-4. うまくいかないとき

よくある原因:

- 0001 を先に流していない
- SQL の一部だけ貼ってしまった
- 別の Supabase プロジェクトで実行している

確認方法:

- `Table Editor`
- `public`
- `tasks`

で列一覧を見る

## 4. 課題マスタを投入する

### 4-1. Seed SQL を実行する

対象ファイル:

- [supabase/seed/001_tasks.sql](/Users/yuta/vexum/internal%20system/training/supabase/seed/001_tasks.sql)

やること:

- SQL Editor で新しいクエリを開く
- 上記ファイルを全量コピーして貼る
- `Run` を押す

### 4-2. 成功確認

`Table Editor > public > tasks` を開いて、以下を確認してください。

確認項目:

- `TASK-01` から `TASK-10` が入っている
- 各行に `title` が入っている
- `acceptance_criteria_json` に JSON が入っている
- `ai_review_rubric_json` に JSON が入っている
- `mentor_evaluation_sheet_json` に JSON が入っている

### 4-3. SQL で件数確認したい場合

```sql
select count(*) from public.tasks;
```

期待値:

- `10`

### 4-4. 一覧確認したい場合

```sql
select task_code, title, category, difficulty
from public.tasks
order by task_code;
```

## 5. Google OAuth を設定する

この設定は、今後 Google Workspace ログインを有効化するために必要です。

### 5-1. Google Cloud Console 側で準備する

やること:

- Google Cloud Console を開く
- OAuth 用のプロジェクトを選ぶ、または新規作成する
- `APIs & Services`
- `Credentials`
- `Create Credentials`
- `OAuth client ID`

必要に応じて先に設定するもの:

- OAuth consent screen

### 5-2. OAuth consent screen を設定する

設定例:

- App name: `Tech-Quest`
- User support email: 管理者メール
- Authorized domains: 社内ドメイン
- Developer contact information: 管理者メール

社内限定想定なら:

- Internal を選べる場合は Internal を選ぶ

### 5-3. OAuth Client を作成する

アプリタイプ:

- Web application

設定する項目:

- Name: `Tech-Quest Supabase Auth`
- Authorized redirect URIs:
  Supabase の Google Provider 設定画面に表示される Redirect URL

### 5-4. Supabase 側で Google Provider を有効化する

Supabase ダッシュボードで:

- `Authentication`
- `Providers`
- `Google`

やること:

- Enable を ON
- Google Cloud で発行した `Client ID` を入力
- `Client Secret` を入力
- Save

### 5-5. ドメイン制限について

本システムは社内ユーザー限定想定なので、最低限以下を整理してください。

決めること:

- 許可する Google Workspace ドメイン
- 個人 Gmail を拒否するか
- 例外アカウントを許可するか

今のアプリ側では:

- `.env.local` の `GOOGLE_WORKSPACE_DOMAIN` を参照する前提です

## 6. Storage バケットを作成する

提出物の証跡ファイル保存のため、Storage を先に用意しておくと後続実装がスムーズです。

### 6-1. Storage バケット作成

Supabase ダッシュボードで:

- `Storage`
- `Create a new bucket`

推奨値:

- Bucket name: `submission-evidence`
- Public bucket: `OFF`

### 6-2. バケット作成後の確認

確認すること:

- `submission-evidence` が作成されている
- Public になっていない

### 6-3. 今の時点の注意

- まだ Storage の RLS は細かく設定していません
- 後続で「受講生本人・メンター・管理者のみアクセス可」にします

## 7. ローカルでアプリを起動する

### 7-1. 依存関係をインストールする

プロジェクトルートで実行:

```bash
npm install
```

### 7-2. 開発サーバーを起動する

```bash
npm run dev
```

### 7-3. ブラウザで確認する

通常は以下を開きます。

- `http://localhost:3000`

確認したい画面:

- `/admin/tasks`
- `/quests`
- `/quests/TASK-01`

### 7-4. 接続確認のポイント

`/admin/tasks` で確認すること:

- 画面が表示される
- 課題一覧が 10 件見える
- タイトルが seed した内容になっている

`/quests/TASK-01` で確認すること:

- 合格条件が表示される
- AI 一次レビュー Rubric が表示される
- メンター評価シートが表示される

## 8. うまくいかない場合の切り分け

### ケース1: 画面は出るがデータが古いモックのまま見える

考えられる原因:

- `.env.local` の Supabase 値が未設定
- `service_role key` が間違っている
- `tasks` テーブルへの seed が未実行

確認方法:

- `.env.local` を見直す
- Supabase `Table Editor` で `tasks` にデータがあるか確認する

### ケース2: `tasks` が 0 件

考えられる原因:

- seed SQL をまだ流していない
- 別のプロジェクトに流した

確認 SQL:

```sql
select task_code, title from public.tasks order by task_code;
```

### ケース3: Google ログインが使えない

考えられる原因:

- Redirect URI が間違っている
- Client ID / Secret が違う
- OAuth consent screen が未設定

### ケース4: `npm run dev` が起動しない

考えられる原因:

- `npm install` 未実行
- Node.js バージョン差異
- `.env.local` の書式崩れ

## 9. この段階でユーザーに整理しておいてほしいこと

今後の本番実装を進めるために、以下を決めておいてください。

- 本番・検証用の Supabase を分けるか
- 管理者にするユーザーのメールアドレス
- メンター権限を持つユーザーの想定人数
- Google Workspace の許可ドメイン
- Slack 通知先チャンネル
- 提出ファイルの保持期間
- NotebookLM や LINE など外部連携課題で使う検証用アカウント

## 10. 作業完了のチェックリスト

以下が終わっていれば、この段階のユーザー作業は完了です。

- Supabase プロジェクトを作成した
- `.env.local` を作成した
- `0001_initial_schema.sql` を実行した
- `0002_expand_task_catalog.sql` を実行した
- `001_tasks.sql` を実行した
- `public.tasks` に 10 件入っている
- Google Provider を有効化した
- `submission-evidence` バケットを作成した
- `npm install` を実行した
- `npm run dev` でアプリ起動を確認した
- `/admin/tasks` で課題一覧が表示された

## 11. このあとこちらが進める実装

ユーザー側の上記作業が終わったら、こちらで次を進められます。

- `admin/tasks` の編集機能
- 提出データの DB 保存
- 提出ファイルアップロード
- メンター採点保存
- Google ログインとロール管理
- RLS

次の作業に進むときは、以下のどちらかを伝えてください。

- `手順書どおり完了しました`
- `〇〇の手順で詰まりました`

## 12. 提出保存機能の確認手順

提出機能は、提出メタデータを Supabase に保存する段階まで進んでいます。

### 12-1. 画面を開く

- `http://127.0.0.1:3000/submissions/new`

### 12-2. 入力する項目

- 受講生名
- メールアドレス
- 対象課題
- ソースコード URL
- 証跡ファイルメモ
- ビジネス価値への考察

### 12-3. 送信後に確認すること

期待する結果:

- 画面上で「提出内容を保存しました」と表示される
- Supabase の `public.submissions` に 1 件追加される
- `public.profiles` に受講生メールが未登録なら自動追加される

### 12-4. Supabase で確認するテーブル

- `public.profiles`
- `public.submissions`

補足:

- 現在の運用では `期` は使いません
- 提出、担当割り当て、レビューはすべてユーザー単位で管理されます
- 既存 DB に `batches` / `batch_members` が残っていても、通常運用では参照しません

### 12-5. 補足

- 証跡ファイルを選択した場合、`submission-evidence` バケットへ保存されます
- いま保存されるのは提出メタデータ、証跡ファイル、証跡メモです
- `public.submission_files` にファイルパスが記録されます
- 参考リンクは任意です
- README 形式の本文が主提出物です
- コードファイルやコードフォルダを添付すると AI レビュー精度が上がります

### 12-6. 期データを物理的に削除したい場合

対象ファイル:

- [supabase/migrations/0008_remove_batch_data_model.sql](/Users/yuta/vexum/internal%20system/training/supabase/migrations/0008_remove_batch_data_model.sql)

この migration を実行すると、以下を削除します。

- `public.submissions.batch_id`
- `public.batch_members`
- `public.batches`

注意:

- 既存の期データは完全に不要であることを確認してから実行してください
- 実行後は期別管理へ戻す前提の SQL が使えなくなります

## 12-7. Google Docs 出力を使いたい場合

管理画面から要件定義書と設計書を Google ドキュメントへ出力できます。

必要な環境変数:

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `GOOGLE_DRIVE_FOLDER_ID` 任意

前提:

- Google Cloud でサービスアカウントを作成する
- Google Docs API と Google Drive API を有効化する
- 保存先フォルダを使う場合、そのフォルダをサービスアカウントへ共有する

出力元ファイル:

- `docs/google-docs-requirements-spec.md`
- `docs/google-docs-design-spec.md`

実行場所:

- 管理者でログイン
- `/admin/tasks`
- `Google Docs 出力` カードから実行

## 13. 現在の動作確認手順

この章では、現時点で実装済みの以下をまとめて確認します。

- Google ログイン
- ロール別画面制御
- 提出保存
- AI 一次レビュー
- メンター採点
- ユーザー管理

### 13-1. 事前準備

事前に以下を済ませてください。

- `.env.local` に Supabase / Gemini / Google OAuth の値が入っている
- `npm run dev` でローカルサーバーが起動している
- 対象ユーザーで一度ログインし、`profiles` にレコードが作られている

### 13-2. ログイン確認

開く画面:

- `http://127.0.0.1:3000/login`

確認すること:

- Google Workspace でログインできる
- ログイン後にホームへ戻る
- 左サイドバーにログイン中ユーザー名とロールが出る

### 13-3. 提出確認

開く画面:

- `http://127.0.0.1:3000/submissions/new`

やること:

- 課題を選択する
- 表示された README テンプレートを参考に本文を書く
- 必要に応じて証跡ファイルを添付する
- 必要に応じてコードファイルまたはコードフォルダを添付する
- `提出内容を保存する` を押す

確認すること:

- 成功メッセージが表示される
- `public.submissions` に 1 件追加される
- 添付したファイルが `public.submission_files` に記録される
- Storage の `submission-evidence` にファイルが入る

### 13-4. コードフォルダ提出時の注意

コードフォルダ提出は便利ですが、重いディレクトリをそのまま上げるとアップロードが不安定になります。

守ること:

- `node_modules`, `.git`, `.next`, `dist`, `build` は含めない
- `src`, `app`, `gas`, `scripts` など主要コードだけに絞る
- 上限は `40 ファイル / 合計 8MB`

推奨:

- まずは `README`, `package.json`, `main.gs`, `app.py`, `src/` など最小構成で試す

### 13-5. 提出詳細確認

開く画面:

- `http://127.0.0.1:3000/mentor/reviews`

やること:

- 一覧の `提出詳細を見る` を押す

確認すること:

- README / 提出内容が表示される
- 参考リンクが入力されていれば表示される
- 証跡ファイル一覧が表示される
- AI 一次レビューエリアが表示される

### 13-6. AI 一次レビュー確認

開く画面:

- 提出詳細ページ

やること:

- `AIレビューを実行` を押す

確認すること:

- 要約が表示される
- `セキュリティ / 可読性 / ビジネス価値` のスコアが出る
- `合格条件チェック` が表示される
- 指摘一覧と改善提案が表示される
- `public.ai_reviews` に保存される
- `public.submissions.status` が `submitted` から `ai_reviewed` になる

### 13-7. メンター採点確認

前提:

- 対象ユーザーの `profiles.role` が `mentor` または `admin`

開く画面:

- `http://127.0.0.1:3000/mentor/reviews`

やること:

- 提出詳細を開く
- 技術点、ビジネス点、判定、コメントを入れる
- `レビューを保存する` を押す

確認すること:

- 保存メッセージが表示される
- 採点カードに切り替わる
- `public.mentor_reviews` に保存される
- `public.submissions.status` が `passed` または `rework_requested` になる

### 13-8. ユーザー管理確認

前提:

- 対象ユーザーの `profiles.role` が `admin`

開く画面:

- `http://127.0.0.1:3000/admin/learners`

確認すること:

- `profiles` の一覧が表示される
- 各ユーザーのロールを変更できる
- 変更後に再ログインすると権限が反映される

### 13-9. 確認用 SQL

ユーザー一覧:

```sql
select email, role
from public.profiles
order by created_at desc;
```

提出一覧:

```sql
select id, status, submitted_at
from public.submissions
order by submitted_at desc;
```

AIレビュー:

```sql
select submission_id, summary, reviewed_at
from public.ai_reviews
order by reviewed_at desc;
```

メンター採点:

```sql
select submission_id, technical_score, business_score, result, reviewed_at
from public.mentor_reviews
order by reviewed_at desc;
```

## 14. 次にやること

現時点で、基本運用フローは一通り動きます。

次に進める候補は以下です。

### 14-1. 優先度高: 課題管理を本番化する

対象:

- `admin/tasks`

やること:

- 課題タイトル
- 合格条件
- AI rubric
- README テンプレート向け文言

を管理画面から編集できるようにする

### 14-2. 優先度高: Supabase RLS を入れる

やること:

- 受講生は自分の提出だけ見られる
- メンターはレビュー対象だけ見られる
- admin は全件見られる

ように DB 側でも制御する

### 14-3. 優先度中: AIレビューの精度を上げる

やること:

- README 優先の few-shot 例を追加
- 課題カテゴリ別の観点差分を増やす
- コードファイルの優先順位付けを改善する

### 14-4. 優先度中: zip 展開対応

今はフォルダ提出や単一ファイル提出が AI に向いています。

将来的には:

- zip を受け取る
- サーバー側で展開する
- 主要コードだけ抽出する

にも対応できます。

### 14-5. 優先度中: Slack 通知

やること:

- 提出完了時
- AIレビュー完了時
- 差し戻し時

に Slack 通知を飛ばす

### 14-6. 優先度中: ナレッジ共有の本番化

やること:

- 合格済み提出からナレッジ公開する
- README と証跡をライブラリ化する

## 15. Storage アクセス制御の反映

提出ファイルの保存先 `submission-evidence` バケットにも、提出者本人または `mentor / admin` だけがアクセスできるようにします。

やること:

1. Supabase の `SQL Editor` を開く
2. [0005_storage_submission_evidence_policies.sql](/Users/yuta/vexum/internal%20system/training/supabase/migrations/0005_storage_submission_evidence_policies.sql) を実行する
3. `destructive operations` の警告が出ても、今回は既存 policy の差し替えなのでそのまま進めてよい

確認ポイント:

- 受講生ユーザーでログインして自分の提出詳細を開ける
- メンターまたは管理者で他人の提出詳細を開ける
- 他の受講生の提出ファイルへ直接アクセスできない

補足:

- 現在のサーバー API は `service_role` を使っている箇所があるため、今回の適用直後に画面が壊れる可能性は低いです
- 今後 client 側から Storage を直接扱うときに、この policy が効いてきます

## 16. 担当メンター機能の反映

提出ごとに担当メンターを持てるようにしています。メンター側で `自分を担当にする` を押すと、一覧の `自分の担当だけ見る` と連動します。

やること:

1. Supabase の `SQL Editor` を開く
2. [0006_add_assigned_mentor_to_submissions.sql](/Users/yuta/vexum/internal%20system/training/supabase/migrations/0006_add_assigned_mentor_to_submissions.sql) を実行する

確認ポイント:

- `http://127.0.0.1:3000/submissions`
  自分の提出一覧が見える
- `http://127.0.0.1:3000/mentor/reviews`
  受講生名で検索できる
- `http://127.0.0.1:3000/mentor/reviews/<submissionId>`
  `自分を担当にする` を押せる
- 一覧へ戻って `自分の担当だけ見る` をオンにすると、担当化した提出だけが残る

## 17. 導線の見え方

現在のメイン導線は次の 3 本です。

- 受講生:
  `課題一覧` → `課題提出` → `提出状況`
- メンター:
  `提出レビュー`
  一覧で検索、担当化、詳細確認、採点まで進める
- 管理者:
  `提出レビュー`、`課題管理`、`ユーザー管理`

補足:

- `提出レビュー` 一覧から `自分を担当にする` を押せます
- 受講生は `提出状況` で AIレビューとメンター評価を追えます

## 18. Slack 通知の確認

Slack 通知は次のタイミングで送られます。

- 提出完了時
- AIレビュー完了時
- メンター評価保存時

事前確認:

1. `.env.local` に `SLACK_BOT_TOKEN` と `SLACK_REVIEW_CHANNEL` が入っている
2. Bot が対象チャンネルに招待されている
3. Bot に `chat:write` が付与されている

確認手順:

1. 課題を 1 件提出する
2. Slack に `新しい提出が登録されました` が届く
3. 提出詳細で `AIレビューを実行` する
4. Slack に `AI一次レビューが完了しました` が届く
5. メンター評価を保存する
6. Slack に `メンター評価が登録されました` が届く

うまく届かない場合:

- `SLACK_REVIEW_CHANNEL` はチャンネル ID を使うのが安全
- Bot がチャンネルに入っていないと送れない
- 通知失敗でも提出やレビュー保存自体は止まらない

## 19. おすすめの次の進め方

迷う場合は、次の順がおすすめです。

1. Slack 通知の動作確認
2. ナレッジ共有を本番化する
3. `zip` 展開対応や AIレビュー精度改善を進める

この順で進めると、運用開始に必要な土台がかなり固まります。
