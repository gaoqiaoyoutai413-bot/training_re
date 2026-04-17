import type { StarterKit } from "@/types/domain";

export const taskStarterKits: Record<string, StarterKit> = {
  "TASK-01": {
    title: "見積書自動作成 スターターセット",
    description: "顧客マスタと出勤実績のサンプルを先に配布し、GAS 実装からすぐ着手できるようにします。",
    setupSteps: [
      "顧客マスタと出勤実績 CSV をスプレッドシートへ取り込む",
      "見積書テンプレート用シートを1枚作成する",
      "GAS で転記処理とカスタムメニューを実装する",
    ],
    files: [
      {
        label: "顧客マスタ CSV",
        path: "/starter-kits/TASK-01/customers.csv",
        description: "顧客名、担当者、単価などを含むサンプルデータです。",
      },
      {
        label: "出勤実績 CSV",
        path: "/starter-kits/TASK-01/attendance.csv",
        description: "出勤日数・時間から見積対象を計算するための実績データです。",
      },
    ],
  },
  "TASK-02": {
    title: "会議候補日抽出 スターターセット",
    description: "比較対象のメンバー一覧を渡し、カレンダー取得ロジックから実装を始められます。",
    setupSteps: [
      "メンバー一覧 CSV をスプレッドシートへ取り込む",
      "1週間の検索対象期間を決める",
      "CalendarApp で予定を取得して空き時間を比較する",
    ],
    files: [
      {
        label: "会議対象メンバー CSV",
        path: "/starter-kits/TASK-02/members.csv",
        description: "カレンダー比較対象のダミー社員メール一覧です。",
      },
    ],
  },
  "TASK-03": {
    title: "Slackアラート スターターセット",
    description: "監視対象となる追客・報告一覧を最初から用意し、通知条件の実装へすぐ進めます。",
    setupSteps: [
      "監視対象一覧 CSV をスプレッドシートへ取り込む",
      "期限切れ・未報告の判定条件を決める",
      "Webhook 通知とトリガー実行を実装する",
    ],
    files: [
      {
        label: "監視対象一覧 CSV",
        path: "/starter-kits/TASK-03/alert-targets.csv",
        description: "追客状況や報告状態を含むアラート判定用データです。",
      },
    ],
  },
  "TASK-04": {
    title: "LINEリマインダー スターターセット",
    description: "対象者一覧と予定日データを先渡しし、通知条件と API 呼び出しに集中できます。",
    setupSteps: [
      "送信対象 CSV をシートへ取り込む",
      "前日・7日前の判定ロジックを実装する",
      "LINE Messaging API の送信処理とエラー処理を実装する",
    ],
    files: [
      {
        label: "LINE送信対象 CSV",
        path: "/starter-kits/TASK-04/reminder-targets.csv",
        description: "LINE ID、予定日、通知種別を含むダミーデータです。",
      },
    ],
  },
  "TASK-05": {
    title: "AIテキスト整形 スターターセット",
    description: "入力揺れのある依頼文サンプルをまとめて渡し、プロンプト調整から始められます。",
    setupSteps: [
      "依頼文サンプル CSV をシートへ取り込む",
      "出力フォーマットを決める",
      "Gemini プロンプトとパース処理を実装する",
    ],
    files: [
      {
        label: "依頼文サンプル CSV",
        path: "/starter-kits/TASK-05/raw-requests.csv",
        description: "メール・LINE 由来のバラバラな依頼文サンプルです。",
      },
    ],
  },
  "TASK-06": {
    title: "NotebookLM FAQ スターターセット",
    description: "先にマニュアル構成案とサンプル PDF を渡し、どの資料を作ればよいか迷わず PoC に入れます。",
    setupSteps: [
      "マニュアル構成案や PDF サンプルをもとにソース資料を作成する",
      "NotebookLM にソースをアップロードする",
      "FAQ の成功例と情報不足例を検証する",
    ],
    files: [
      {
        label: "マニュアル構成案 Markdown",
        path: "/starter-kits/TASK-06/manual-outline.md",
        description: "業務マニュアルや規程集の章立てサンプルです。",
      },
      {
        label: "FAQサンプル PDF",
        path: "/starter-kits/TASK-06/manual-sample.pdf",
        description: "NotebookLM に取り込むサンプル資料です。",
      },
    ],
  },
  "TASK-07": {
    title: "Notionカード生成 スターターセット",
    description: "元データ一覧を先に配布し、ペイロード設計と同期処理に集中できます。",
    setupSteps: [
      "取引先一覧 CSV をシートへ取り込む",
      "Notion DB のプロパティ設計を合わせる",
      "1行ずつカード生成するペイロードを組み立てる",
    ],
    files: [
      {
        label: "Notion生成元 CSV",
        path: "/starter-kits/TASK-07/notion-card-seed.csv",
        description: "取引先名、期限、担当などを含むカード生成元データです。",
      },
    ],
  },
  "TASK-08": {
    title: "OCR転記 スターターセット",
    description: "OCR 対象画像と期待抽出値を先に渡し、正規表現ロジックの検証から始められます。",
    setupSteps: [
      "サンプル請求書画像と期待抽出値を確認する",
      "OCR と抽出ロジックを実装する",
      "抽出結果が期待値に一致するか検証する",
    ],
    files: [
      {
        label: "OCR期待値 CSV",
        path: "/starter-kits/TASK-08/ocr-expected-values.csv",
        description: "請求書から抽出したい日付・金額・取引先の期待値です。",
      },
      {
        label: "請求書サンプル画像",
        path: "/starter-kits/TASK-08/invoice-sample-01.svg",
        description: "OCR 検証用のダミー請求書画像です。",
      },
      {
        label: "領収書サンプル画像",
        path: "/starter-kits/TASK-08/receipt-sample-01.svg",
        description: "別レイアウトの OCR 検証用画像です。",
      },
    ],
  },
  "TASK-09": {
    title: "最適化アルゴリズム スターターセット",
    description: "制約条件付きの入力 JSON をそのまま配布し、アルゴリズム実装から始められます。",
    setupSteps: [
      "入力 JSON を読み込める環境を用意する",
      "制約条件を関数へ分解する",
      "解なしケースも含めて出力を確認する",
    ],
    files: [
      {
        label: "シフト条件 JSON",
        path: "/starter-kits/TASK-09/shift-input.json",
        description: "スタッフ条件、希望休、必要人数を含む入力例です。",
      },
    ],
  },
  "TASK-10": {
    title: "日報フォーム スターターセット",
    description: "フォーム項目定義を渡し、入力 UI と保存処理の実装から始められます。",
    setupSteps: [
      "項目定義 CSV をもとにフォーム UI を設計する",
      "スプレッドシート保存列を決める",
      "google.script.run の送受信を実装する",
    ],
    files: [
      {
        label: "日報項目定義 CSV",
        path: "/starter-kits/TASK-10/report-fields.csv",
        description: "日報・進捗報告で扱う入力項目の定義一覧です。",
      },
    ],
  },
};
