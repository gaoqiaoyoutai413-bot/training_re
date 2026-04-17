alter table public.tasks
  add column if not exists starter_kit_title text,
  add column if not exists starter_kit_description text,
  add column if not exists starter_kit_steps_json jsonb not null default '[]'::jsonb,
  add column if not exists starter_kit_files_json jsonb not null default '[]'::jsonb;

update public.tasks
set
  starter_kit_title = case task_code
    when 'TASK-01' then '見積書自動作成 スターターセット'
    when 'TASK-02' then '会議候補日抽出 スターターセット'
    when 'TASK-03' then 'Slackアラート スターターセット'
    when 'TASK-04' then 'LINEリマインダー スターターセット'
    when 'TASK-05' then 'AIテキスト整形 スターターセット'
    when 'TASK-06' then 'NotebookLM FAQ スターターセット'
    when 'TASK-07' then 'Notionカード生成 スターターセット'
    when 'TASK-08' then 'OCR転記 スターターセット'
    when 'TASK-09' then '最適化アルゴリズム スターターセット'
    when 'TASK-10' then '日報フォーム スターターセット'
    else starter_kit_title
  end,
  starter_kit_description = case task_code
    when 'TASK-01' then '顧客マスタと出勤実績のサンプルを先に配布し、GAS 実装からすぐ着手できるようにします。'
    when 'TASK-02' then '比較対象のメンバー一覧を渡し、カレンダー取得ロジックから実装を始められます。'
    when 'TASK-03' then '監視対象となる追客・報告一覧を最初から用意し、通知条件の実装へすぐ進めます。'
    when 'TASK-04' then '対象者一覧と予定日データを先渡しし、通知条件と API 呼び出しに集中できます。'
    when 'TASK-05' then '入力揺れのある依頼文サンプルをまとめて渡し、プロンプト調整から始められます。'
    when 'TASK-06' then '先にマニュアル構成案とサンプル PDF を渡し、どの資料を作ればよいか迷わず PoC に入れます。'
    when 'TASK-07' then '元データ一覧を先に配布し、ペイロード設計と同期処理に集中できます。'
    when 'TASK-08' then 'OCR 対象画像と期待抽出値を先に渡し、正規表現ロジックの検証から始められます。'
    when 'TASK-09' then '制約条件付きの入力 JSON をそのまま配布し、アルゴリズム実装から始められます。'
    when 'TASK-10' then 'フォーム項目定義を渡し、入力 UI と保存処理の実装から始められます。'
    else starter_kit_description
  end,
  starter_kit_steps_json = case task_code
    when 'TASK-01' then '["顧客マスタと出勤実績 CSV をスプレッドシートへ取り込む","見積書テンプレート用シートを1枚作成する","GAS で転記処理とカスタムメニューを実装する"]'::jsonb
    when 'TASK-02' then '["メンバー一覧 CSV をスプレッドシートへ取り込む","1週間の検索対象期間を決める","CalendarApp で予定を取得して空き時間を比較する"]'::jsonb
    when 'TASK-03' then '["監視対象一覧 CSV をスプレッドシートへ取り込む","期限切れ・未報告の判定条件を決める","Webhook 通知とトリガー実行を実装する"]'::jsonb
    when 'TASK-04' then '["送信対象 CSV をシートへ取り込む","前日・7日前の判定ロジックを実装する","LINE Messaging API の送信処理とエラー処理を実装する"]'::jsonb
    when 'TASK-05' then '["依頼文サンプル CSV をシートへ取り込む","出力フォーマットを決める","Gemini プロンプトとパース処理を実装する"]'::jsonb
    when 'TASK-06' then '["マニュアル構成案や PDF サンプルをもとにソース資料を作成する","NotebookLM にソースをアップロードする","FAQ の成功例と情報不足例を検証する"]'::jsonb
    when 'TASK-07' then '["取引先一覧 CSV をシートへ取り込む","Notion DB のプロパティ設計を合わせる","1行ずつカード生成するペイロードを組み立てる"]'::jsonb
    when 'TASK-08' then '["サンプル請求書画像と期待抽出値を確認する","OCR と抽出ロジックを実装する","抽出結果が期待値に一致するか検証する"]'::jsonb
    when 'TASK-09' then '["入力 JSON を読み込める環境を用意する","制約条件を関数へ分解する","解なしケースも含めて出力を確認する"]'::jsonb
    when 'TASK-10' then '["項目定義 CSV をもとにフォーム UI を設計する","スプレッドシート保存列を決める","google.script.run の送受信を実装する"]'::jsonb
    else starter_kit_steps_json
  end,
  starter_kit_files_json = case task_code
    when 'TASK-01' then '[{"label":"顧客マスタ CSV","path":"/starter-kits/TASK-01/customers.csv","description":"顧客名、担当者、単価などを含むサンプルデータです。"},{"label":"出勤実績 CSV","path":"/starter-kits/TASK-01/attendance.csv","description":"出勤日数・時間から見積対象を計算するための実績データです。"}]'::jsonb
    when 'TASK-02' then '[{"label":"会議対象メンバー CSV","path":"/starter-kits/TASK-02/members.csv","description":"カレンダー比較対象のダミー社員メール一覧です。"}]'::jsonb
    when 'TASK-03' then '[{"label":"監視対象一覧 CSV","path":"/starter-kits/TASK-03/alert-targets.csv","description":"追客状況や報告状態を含むアラート判定用データです。"}]'::jsonb
    when 'TASK-04' then '[{"label":"LINE送信対象 CSV","path":"/starter-kits/TASK-04/reminder-targets.csv","description":"LINE ID、予定日、通知種別を含むダミーデータです。"}]'::jsonb
    when 'TASK-05' then '[{"label":"依頼文サンプル CSV","path":"/starter-kits/TASK-05/raw-requests.csv","description":"メール・LINE 由来のバラバラな依頼文サンプルです。"}]'::jsonb
    when 'TASK-06' then '[{"label":"マニュアル構成案 Markdown","path":"/starter-kits/TASK-06/manual-outline.md","description":"業務マニュアルや規程集の章立てサンプルです。"},{"label":"FAQサンプル PDF","path":"/starter-kits/TASK-06/manual-sample.pdf","description":"NotebookLM に取り込むサンプル資料です。"}]'::jsonb
    when 'TASK-07' then '[{"label":"Notion生成元 CSV","path":"/starter-kits/TASK-07/notion-card-seed.csv","description":"取引先名、期限、担当などを含むカード生成元データです。"}]'::jsonb
    when 'TASK-08' then '[{"label":"OCR期待値 CSV","path":"/starter-kits/TASK-08/ocr-expected-values.csv","description":"請求書から抽出したい日付・金額・取引先の期待値です。"},{"label":"請求書サンプル画像","path":"/starter-kits/TASK-08/invoice-sample-01.svg","description":"OCR 検証用のダミー請求書画像です。"},{"label":"領収書サンプル画像","path":"/starter-kits/TASK-08/receipt-sample-01.svg","description":"別レイアウトの OCR 検証用画像です。"}]'::jsonb
    when 'TASK-09' then '[{"label":"シフト条件 JSON","path":"/starter-kits/TASK-09/shift-input.json","description":"スタッフ条件、希望休、必要人数を含む入力例です。"}]'::jsonb
    when 'TASK-10' then '[{"label":"日報項目定義 CSV","path":"/starter-kits/TASK-10/report-fields.csv","description":"日報・進捗報告で扱う入力項目の定義一覧です。"}]'::jsonb
    else starter_kit_files_json
  end
where task_code like 'TASK-%';
