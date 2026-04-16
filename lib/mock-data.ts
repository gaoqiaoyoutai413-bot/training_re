import type {
  BatchSummary,
  DashboardMetrics,
  KnowledgeEntry,
  LearnerSnapshot,
  MentorReviewDraft,
  Submission,
  Task,
} from "@/types/domain";

export const tasks: Task[] = [
  {
    id: "task-01",
    taskCode: "TASK-01",
    version: 1,
    title: "スプレッドシートのデータを利用した「見積書自動作成」",
    summary: "顧客情報と出勤実績を読み込み、見積書を自動生成する GAS 課題。",
    category: "internal_ops",
    difficulty: 1,
    estimatedHours: 5,
    skills: { automation: 36, ai: 0, integration: 18 },
    learningObjective:
      "GAS を用いたスプレッドシートの基本操作、データ抽出、別シートや PDF への出力方法を学ぶ。",
    learnerActions: [
      "顧客情報や出勤実績のダミーデータをスプレッドシートに用意する",
      "GAS で必要データを読み込み、指定フォーマットの見積書シートへ転記する",
      "カスタムメニューから見積書生成を実行できるようにする",
      "可能であれば PDF 化して保存する機能まで実装する",
    ],
    deliverables: [
      "完成したスプレッドシートへのリンク",
      "GAS のコード",
      "実行結果のキャプチャまたは生成された PDF",
    ],
    businessImpact:
      "手作業による転記ミスを減らし、2時間かかっていた見積書作成を数分に短縮することを狙う。",
    background: "別システムから抽出した実績データ（出勤表など）をスプレッドシートにまとめ、そこから毎回目視で必要な項目を拾い出して、手作業で見積書に転記しています。また、部署や営業マンごとにエクセルのテンプレートが異なり、新人がどう書けばいいか迷う状況です。",
    specificIssue: "目視による転記作業で時間がかかり、忙しいと見積書の作成自体が滞ってしまいます。手作業による入力ミスも防ぐ必要があります。",
    finalGoal: "出勤実績や顧客情報のデータから、ボタン一つで統一されたフォーマットの見積書が自動生成される状態。人間は「必要な箇所を確認するだけ」になり、数時間かかっていた作業を数分に短縮します。",
    recommendedDependencies: [
      { taskCode: "BASIC-JS", reason: "JavaScript の基礎構文が前提" },
      { taskCode: "BASIC-SHEET", reason: "スプレッドシートの基本操作に慣れていると進めやすい" },
    ],
    rubricHighlights: ["GAS 動作確認", "カスタムメニュー", "可読性", "エラーハンドリング"],
    businessValueChecks: ["ヒューマンエラー削減", "見積作成工数短縮", "コア業務への集中"],
    acceptanceCriteria: {
      mustHave: [
        "顧客情報・金額データから別シートまたは PDF へ見積書フォーマットで転記されること",
        "GAS のカスタムメニューから実行できること",
      ],
      minimumErrorHandling: [
        "顧客名や金額などの必須項目が空欄の場合にアラートを表示すること",
        "エラー時は『必須項目が入力されていません』と表示して処理を中断すること",
      ],
      requiredSubmissionItems: [
        "GAS コードを含むスプレッドシート URL",
        "生成された見積書のキャプチャ",
        "業務価値の説明文",
      ],
    },
    aiReviewRubric: [
      { title: "可読性", description: "変数名が適切で、処理ごとにコメントがあるか" },
      { title: "保守性", description: "セル番地のハードコーディングを避け、見出しなどで動的取得しているか" },
      { title: "業務価値の説明", description: "転記ミス削減などの実務メリットが言語化されているか" },
    ],
    mentorEvaluationSheet: {
      technicalPointLabel: "GAS の基礎構文、スプレッドシート API の基本操作が身についているか",
      businessPointLabel: "実務で使えるフォーマットか。運用者が迷わず押せる UI になっているか",
      returnReasons: [
        "対象データ行をハードコーディングしているため、データ増加時に対応できません。",
      ],
      commentTemplate:
        "GAS の基礎がしっかり実装できています。次は『PDF化して指定フォルダに保存する』機能の追加に挑戦してみましょう。",
    },
  },
  {
    id: "task-02",
    taskCode: "TASK-02",
    version: 1,
    title: "カレンダー情報を取得する「会議候補日抽出ツール」",
    summary: "複数メンバーの予定を比較し、空き時間を自動抽出する GAS 課題。",
    category: "internal_ops",
    difficulty: 2,
    estimatedHours: 8,
    skills: { automation: 24, ai: 0, integration: 28 },
    learningObjective:
      "Google Calendar 連携、配列操作、ループ、日付日時の扱い方を習得する。",
    learnerActions: [
      "指定した複数メンバーの Google カレンダーから予定を取得する",
      "全員の予定が入っていない空き時間を抽出する",
      "候補日時をスプレッドシートへ一覧出力する",
    ],
    deliverables: [
      "完成したスプレッドシート",
      "GAS スクリプト",
      "動作テスト結果",
    ],
    businessImpact:
      "カレンダーを行き来する手間をなくし、日程調整のコミュニケーションコストを削減する。",
    background: "複数人で会議をする際、該当する社員のGoogleカレンダーを一つ一つ開き、それぞれの予定を見比べながら空いている時間を探しています。",
    specificIssue: "全員のカレンダーを行き来して候補日時を洗い出すのは非常に手間で、日程調整の「前準備」だけで無駄な時間がかかっています。",
    finalGoal: "指定したメンバーのカレンダー情報をシステムが自動で参照し、全員が空いている会議候補日を瞬時にリストアップして提案してくれる状態。",
    recommendedDependencies: [
      { taskCode: "TASK-01", reason: "GAS 基礎とシート操作の理解が活きる" },
      { taskCode: "DATE-OBJECT", reason: "Date オブジェクトの扱いが重要" },
    ],
    rubricHighlights: ["Calendar API 呼び出し", "日時比較ロジック", "複数人比較の効率性"],
    businessValueChecks: ["調整工数削減", "スケジューリング迅速化", "連絡往復の削減"],
    acceptanceCriteria: {
      mustHave: [
        "複数名のアドレスを元に、直近1週間の空き時間を抽出してシートへ出力すること",
      ],
      minimumErrorHandling: [
        "存在しないメールアドレスや権限のないカレンダーを指定しても停止しないこと",
        "対象ユーザーはスキップし、残りの処理を継続すること",
      ],
      requiredSubmissionItems: ["スプレッドシート URL", "実行前後のシート画面キャプチャ"],
    },
    aiReviewRubric: [
      { title: "API利用の適切さ", description: "CalendarApp の検索期間指定が適切で、全件取得していないか" },
      { title: "処理効率", description: "多重ループを避け、配列でまとめて書き込んでいるか" },
      { title: "例外処理", description: "予定が1件もない場合の分岐が正しく実装されているか" },
    ],
    mentorEvaluationSheet: {
      technicalPointLabel: "Date オブジェクトの扱いと配列操作が正確か",
      businessPointLabel: "候補日が人間にとって見やすい形式で出力されているか",
      returnReasons: [
        "スプレッドシートへの書き込みをループ内で行っているため、実行速度が遅くなっています。配列にまとめて最後に一括書き込みしてください。",
      ],
      commentTemplate:
        "複雑な日時の比較ロジックをよく実装できました。実務での日程調整工数の削減に直結する素晴らしいツールです。",
    },
  },
  {
    id: "task-03",
    taskCode: "TASK-03",
    version: 1,
    title: "条件に応じた「Slack・チャットツールアラート通知システム」",
    summary: "期限切れや未報告を検知し、Slack へ自動通知するトリガー課題。",
    category: "internal_ops",
    difficulty: 2,
    estimatedHours: 8,
    skills: { automation: 28, ai: 0, integration: 26 },
    learningObjective:
      "外部 API 利用、Webhook、トリガーによる定期実行、条件分岐の実装を学ぶ。",
    learnerActions: [
      "スプレッドシートにタスク期限や勤怠未報告者のダミーデータを用意する",
      "タイムドリブントリガーで定期チェックを実装する",
      "条件を満たすデータがある場合のみ Slack などへアラート送信する",
    ],
    deliverables: [
      "GAS スクリプト",
      "Webhook URL の設定手順メモ",
      "通知が飛んだチャット画面のスクリーンショット",
    ],
    businessImpact:
      "報告漏れや放置案件を未然に防ぎ、管理者が監視・催促に張り付くコストを減らす。",
    background: "顧客への追客状況や、イベントスタッフの起床・出発報告などをスプレッドシートで管理しています。",
    specificIssue: "管理者がスプレッドシートに張り付いて更新を監視しないと、「未報告」や「数日間アクションがない案件」に気づけません。目視確認の労力が大きく、追客漏れで失注するリスクもあります。",
    finalGoal: "スプレッドシートをシステムが自動監視し、未報告や放置案件がある場合のみSlack等のチャットに通知を飛ばす状態。管理者が「見張り続ける」必要がなくなり、取りこぼしをゼロにします。",
    recommendedDependencies: [
      { taskCode: "HTTP-BASICS", reason: "UrlFetchApp の基礎が前提" },
      { taskCode: "JSON-BASICS", reason: "Webhook の JSON 構造理解が必要" },
    ],
    rubricHighlights: ["トリガー設定", "POST リクエスト", "通知文面の読みやすさ"],
    businessValueChecks: ["管理コスト削減", "報告漏れ防止", "現場判断の高速化"],
    acceptanceCriteria: {
      mustHave: [
        "期限切れ、または特定ステータスの行のみを抽出して外部チャットへ送信すること",
        "タイムドリブントリガーで定期実行されること",
      ],
      minimumErrorHandling: [
        "通知対象が0件の場合は API リクエストを行わず静かに終了すること",
      ],
      requiredSubmissionItems: ["GAS コード", "Webhook 設定手順メモ", "通知画面のキャプチャ"],
    },
    aiReviewRubric: [
      { title: "セキュリティ", description: "Webhook URL がコード直書きでなく、スクリプトプロパティ等で秘匿されているか" },
      { title: "API利用の適切さ", description: "UrlFetchApp による POST リクエストの JSON ペイロードが正しいか" },
      { title: "業務価値の説明", description: "見落とし防止や確認作業削減が説明されているか" },
    ],
    mentorEvaluationSheet: {
      technicalPointLabel: "外部 API 通信の基礎とトリガーの概念を理解しているか",
      businessPointLabel: "誰が何をいつまでに対応すべきか一目で分かる通知文になっているか",
      returnReasons: [
        "Webhook URLがコードに直書きされています。セキュリティの観点からスクリプトプロパティを使用してください。",
      ],
      commentTemplate:
        "外部連携の第一歩クリアです。通知メッセージにメンション機能を追加すると、さらに実務での反応率が上がりますよ。",
    },
  },
  {
    id: "task-04",
    taskCode: "TASK-04",
    version: 1,
    title: "メッセージングAPIを使った「LINEリマインダーボット」",
    summary: "予定日を基準に LINE へ個別リマインドを送る外部 API 連携課題。",
    category: "customer_engagement",
    difficulty: 3,
    estimatedHours: 10,
    skills: { automation: 18, ai: 0, integration: 34 },
    learningObjective:
      "LINE Messaging API、Webhook、ユーザーごとの Push 送信ロジックを理解する。",
    learnerActions: [
      "LINE ID と予定日を記録したシートを用意する",
      "定期実行で前日や 7 日前を判定する",
      "該当ユーザーへ個別に Push メッセージを送信する",
    ],
    deliverables: [
      "GAS スクリプト",
      "LINE Developers 設定画面キャプチャ",
      "LINE 受信画面",
    ],
    businessImpact:
      "手動送信を撤廃し、連絡漏れによる予定忘れを防いでサービス品質を維持する。",
    background: "往診日やシフト、請求書などを、担当者がスプレッドシートを見ながら、各個人のLINE宛に手作業で一件ずつ送信しています。",
    specificIssue: "何百人もの送信先に対して手作業で送るため、毎日何時間も送信作業に取られ、他の業務に支障が出ています。また送信漏れのリスクも抱えています。",
    finalGoal: "システムが自動で対象者を抽出し、予定の7日前や前日に個別のLINEへ一斉送信する状態。数時間かかっていた送信作業をボタン一つ（または完全自動化）で終わらせ、送信漏れもゼロにします。",
    recommendedDependencies: [
      { taskCode: "TASK-03", reason: "外部 API 連携と通知設計の延長線上にある" },
      { taskCode: "API-KEY", reason: "アクセストークン管理の理解が必要" },
    ],
    rubricHighlights: ["トークン管理", "個別送信精度", "日付計算の正確さ"],
    businessValueChecks: ["連絡漏れ撲滅", "顧客接点品質向上", "手動送信の撤廃"],
    acceptanceCriteria: {
      mustHave: [
        "予定の前日になった対象者の LINE ID に Push メッセージを自動送信すること",
      ],
      minimumErrorHandling: [
        "LINE API の送信上限エラーや無効な LINE ID を try-catch で処理すること",
        "HTTP ステータスコードを確認して失敗を検知できること",
      ],
      requiredSubmissionItems: ["GAS コード", "LINE Developer 設定画面キャプチャ", "スマホ受信画面キャプチャ"],
    },
    aiReviewRubric: [
      { title: "セキュリティ", description: "チャネルアクセストークンがプロパティストア等で適切に管理されているか" },
      { title: "例外処理", description: "ネットワークエラーや API エラーをキャッチしログへ出力できているか" },
      { title: "可読性", description: "メッセージ構築処理と送信処理が関数分割されているか" },
    ],
    mentorEvaluationSheet: {
      technicalPointLabel: "LINE Messaging API の仕様理解と堅牢なエラーハンドリング",
      businessPointLabel: "顧客または従業員目線で親切で分かりやすい文面になっているか",
      returnReasons: [
        "日付の判定ロジックにタイムゾーンの考慮が漏れており、実行サーバー時間によっては意図しない日に通知が飛ぶリスクがあります。",
      ],
      commentTemplate:
        "BtoCでも使える重要な技術です。万が一エラーが出た際に、管理者に通知が飛ぶ仕組みをいれると完璧です。",
    },
  },
  {
    id: "task-05",
    taskCode: "TASK-05",
    version: 1,
    title: "生成AIを利用した「募集要項・テキスト整形ツール」",
    summary: "バラバラな依頼文を Gemini API で社内フォーマットへ整形する課題。",
    category: "internal_ops",
    difficulty: 3,
    estimatedHours: 9,
    skills: { automation: 12, ai: 38, integration: 16 },
    learningObjective:
      "LLM API の呼び出し、プロンプトエンジニアリング、非構造化データの構造化を習得する。",
    learnerActions: [
      "メールや LINE 由来のバラバラな依頼文をスプレッドシートへ入力する",
      "GAS 経由で Gemini API に原文と出力フォーマットを渡す",
      "社内規定フォーマットへ整形した結果をシートに書き戻す",
    ],
    deliverables: [
      "GAS スクリプトとプロンプト",
      "実行前後のスプレッドシートデータ",
    ],
    businessImpact:
      "転記や前捌きの工数を削減し、属人的なテキスト処理を標準化する。",
    background: "クライアントから、メールやLINEなど多種多様なバラバラの形式で「依頼文」が届きます。",
    specificIssue: "バラバラな形式のテキストを、一件ずつ手作業でコピー＆ペーストして社内統一フォーマット（募集要項や管理シート）に整形・転記しており、この業務に最も多くの工数を割かれています。",
    finalGoal: "どのような形式で依頼文が届いても、AIが瞬時に内容を読み取り、社内規定のフォーマットに変換・出力する状態。手作業での転記と修正をなくし、数分で処理を完了させます。",
    recommendedDependencies: [
      { taskCode: "HTTP-BASICS", reason: "API 呼び出しの基礎が必要" },
      { taskCode: "JSON-BASICS", reason: "リクエスト・レスポンス整形を理解していると良い" },
    ],
    rubricHighlights: ["プロンプト設計", "API レスポンス処理", "エラー時の処理"],
    businessValueChecks: ["前捌き工数削減", "フォーマット統一", "属人処理の標準化"],
    acceptanceCriteria: {
      mustHave: [
        "バラバラなテキストを Gemini API に渡し、指定 JSON または表形式で整形してシートへ書き出すこと",
      ],
      minimumErrorHandling: [
        "AI レスポンスが指定フォーマットでない場合にパースエラーを検知すること",
        "『再実行してください』などの再試行案内を表示すること",
      ],
      requiredSubmissionItems: [
        "プロンプトを含む GAS コード",
        "実行前後のシートキャプチャ",
        "プロンプトの工夫点の説明",
      ],
    },
    aiReviewRubric: [
      { title: "プロンプトの適切さ", description: "役割指定、出力形式、ハルシネーション防止策が明確か" },
      { title: "例外処理", description: "JSON パースエラー時の try-catch が実装されているか" },
      { title: "セキュリティ", description: "API キーがコードに直書きされていないか" },
    ],
    mentorEvaluationSheet: {
      technicalPointLabel: "LLM API の呼び出し方と非構造化データの構造化スキル",
      businessPointLabel: "前捌き作業の削減効果が具体シナリオで想定できているか",
      returnReasons: [
        "プロンプトの指示が曖昧なため、実行のたびにAIの出力フォーマットがブレてしまい、システムとして安定していません。",
      ],
      commentTemplate:
        "プロンプトエンジニアリングの基本が押さえられています。Few-shot を試すとさらに精度が上がります。",
    },
  },
  {
    id: "task-06",
    taskCode: "TASK-06",
    version: 1,
    title: "NotebookLMを活用した「社内マニュアルFAQボット」",
    summary: "マニュアル群をソースにした FAQ ボットの PoC を構築するノーコード課題。",
    category: "knowledge_management",
    difficulty: 1,
    estimatedHours: 4,
    skills: { automation: 0, ai: 34, integration: 8 },
    learningObjective:
      "RAG の概念理解と、ノーコードツールでの素早い価値検証を経験する。",
    learnerActions: [
      "架空の業務マニュアルや規程集を作成する",
      "Google NotebookLM にアップロードして質問応答を試す",
      "利用ガイドラインを作成する",
    ],
    deliverables: [
      "使用したソースドキュメント",
      "NotebookLM 上での質疑応答スクリーンショット 3 パターン以上",
      "運用時の利用マニュアル",
    ],
    businessImpact:
      "問い合わせの教育コストを減らし、情報アクセス性の向上で業務スピードを高める。",
    background: "社内マニュアルや規程集は存在するものの、量が膨大であったり情報が古かったりして、必要な情報をすぐに探し出せません。",
    specificIssue: "スタッフが自力で情報を探せないため、結果的に管理者や先輩への質問が集中し、答える側の時間が奪われています。",
    finalGoal: "Botに質問するだけで、アップロードされたマニュアルから即座に正しい回答が返ってくる状態。「人に聞くよりBotに聞いた方が早い」環境を作り、教育コストと質問対応の手間を激減させます。",
    recommendedDependencies: [{ taskCode: "PROMPT-BASIC", reason: "質問設計の基礎があると改善しやすい" }],
    rubricHighlights: ["ドキュメント構造", "ハルシネーション抑制", "利用ガイドライン"],
    businessValueChecks: ["問い合わせ削減", "教育コスト削減", "情報アクセス性向上"],
    acceptanceCriteria: {
      mustHave: [
        "複数のダミーマニュアルをアップロードし、特定業務フローへの質問にソースベースで回答できること",
      ],
      minimumErrorHandling: [
        "ソースにない情報を聞かれた際に『情報がありません』と答えるインストラクションを設定すること",
      ],
      requiredSubmissionItems: [
        "アップロードした PDF",
        "成功例と『情報なし』の質問回答キャプチャ",
        "Bot の利用マニュアル",
      ],
    },
    aiReviewRubric: [
      { title: "ドキュメントの構造化", description: "PDF の目次や見出しが整理され、AI が読み取りやすいか" },
      { title: "業務価値の説明", description: "新人教育コスト削減や検索時間短縮が具体的に記述されているか" },
      { title: "ハルシネーション対策", description: "回答がソースに限定されているか" },
    ],
    mentorEvaluationSheet: {
      technicalPointLabel: "RAG の概念理解とソースドキュメントの選定・整形",
      businessPointLabel: "現場がすぐ使えるレベルの利用マニュアルになっているか",
      returnReasons: [
        "ソースドキュメントの形式が画像中心で、AIが適切にテキスト抽出できておらず回答精度が低いです。",
      ],
      commentTemplate:
        "ノーコードでも強力な業務ツールが作れることが体感できたと思います。実際の業務規程集などでも試してみてください。",
    },
  },
  {
    id: "task-07",
    taskCode: "TASK-07",
    version: 1,
    title: "Notion APIを使った「タスク・カード自動生成」",
    summary: "スプレッドシートのデータから Notion データベースへカードを自動生成する課題。",
    category: "internal_ops",
    difficulty: 4,
    estimatedHours: 12,
    skills: { automation: 18, ai: 0, integration: 40 },
    learningObjective:
      "複雑な JSON 構造を持つ Notion API の操作と、ツール間データ同期を理解する。",
    learnerActions: [
      "同期元のスプレッドシートを用意する",
      "Notion API のペイロードを組み立てる",
      "Notion データベースへ管理カードやタスクを自動生成する",
    ],
    deliverables: [
      "GAS スクリプト",
      "同期元のスプレッドシート",
      "生成された Notion データベースのリンクまたはキャプチャ",
    ],
    businessImpact:
      "二重入力や手動カード作成を防ぎ、プロジェクト管理の初動を高速化する。",
    background: "外注先の取引会社ごとの請求書管理や、月次のタスク管理を行うために、Notion上に管理用カード（ページ）を手作業で作成しています。",
    specificIssue: "月が変わるたびに、スプレッドシートのリストを見ながら大量のカードをNotionにポチポチと手作業で作成するルーチン業務に手間がかかっています。",
    finalGoal: "イベント出勤表などのリスト（スプレッドシート）を読み込み、Notion上に必要な取引先分のカードが自動で一括生成される状態。月初の準備作業の手間を省きます。",
    recommendedDependencies: [
      { taskCode: "TASK-03", reason: "外部 API 呼び出しの基礎が必要" },
      { taskCode: "TASK-05", reason: "JSON 構造を深く扱う経験が役立つ" },
    ],
    rubricHighlights: ["ペイロード構築", "API ドキュメント読解", "データ同期の正確性"],
    businessValueChecks: ["二重入力防止", "管理ボード自動化", "初動高速化"],
    acceptanceCriteria: {
      mustHave: [
        "スプレッドシートのリストから Notion API で指定 DB にカードとプロパティを自動作成すること",
      ],
      minimumErrorHandling: [
        "Notion API の通信エラーやプロパティ型不一致をキャッチしてログを残すこと",
      ],
      requiredSubmissionItems: [
        "GAS コード",
        "元データのシート",
        "生成された Notion DB の画面キャプチャ",
      ],
    },
    aiReviewRubric: [
      { title: "API利用の適切さ", description: "parent や properties など深い JSON 階層を正確に構築できているか" },
      { title: "セキュリティ", description: "インテグレーションシークレットが適切に管理されているか" },
      { title: "可読性", description: "JSON ペイロード組み立て処理が関数化されているか" },
    ],
    mentorEvaluationSheet: {
      technicalPointLabel: "複雑な API 仕様の読解力と JSON オブジェクト構築スキル",
      businessPointLabel: "生成された Notion カードがそのままプロジェクト管理に使える粒度か",
      returnReasons: [
        "Notion側のプロパティ型に対して誤ったデータ構造でPOSTしているためエラーになっています。公式ドキュメントを確認してください。",
      ],
      commentTemplate:
        "難易度の高い Notion API をよく攻略しました。モダンな SaaS 間のデータ同期は実務で非常に重宝されます。",
    },
  },
  {
    id: "task-08",
    taskCode: "TASK-08",
    version: 1,
    title: "画像認識（OCR）を用いた「領収書・請求書転記システム」",
    summary: "Drive 上の画像を OCR し、金額や項目を抽出して自動転記する課題。",
    category: "internal_ops",
    difficulty: 4,
    estimatedHours: 12,
    skills: { automation: 22, ai: 14, integration: 32 },
    learningObjective:
      "画像ファイルのテキスト化と、正規表現を用いた必要データの抽出を学ぶ。",
    learnerActions: [
      "Drive の特定フォルダに領収書や請求書画像をアップロードする",
      "Drive API の OCR 機能でテキストを取得する",
      "正規表現で金額や項目を抽出し、シートへ自動転記する",
    ],
    deliverables: [
      "GAS スクリプト",
      "アップロードした画像ファイル",
      "転記先のスプレッドシート",
    ],
    businessImpact:
      "目視入力を削減し、経理・事務の大幅な効率化と入力ミス防止につなげる。",
    background: "日々メールで届く請求書や、紙の領収書をアナログで管理しており、経理や事務担当者が目視で金額をシステムやシートに手入力しています。",
    specificIssue: "ファイルのダウンロード、フォルダへの格納、金額のコピペといった単純作業に毎日時間を取られており、手打ちによる入力ミスのリスクもあります。",
    finalGoal: "請求書を所定のフォルダに格納する（またはメール受信する）だけで、OCRが金額などの情報を読み取り、管理用スプレッドシートに自動転記される状態。常に最新のデータが保たれ、手入力業務をゼロにします。",
    recommendedDependencies: [
      { taskCode: "REGEX", reason: "正規表現の理解が必要" },
      { taskCode: "DRIVE-API", reason: "Advanced Google Services の利用経験が役立つ" },
    ],
    rubricHighlights: ["Drive API 呼び出し", "正規表現抽出精度", "例外パターン考慮"],
    businessValueChecks: ["データ入力削減", "入力ミス防止", "経理効率化"],
    acceptanceCriteria: {
      mustHave: [
        "Drive API で画像テキストを取得し、正規表現で合計金額と日付を抽出してシートへ転記すること",
      ],
      minimumErrorHandling: [
        "画像が不鮮明で抽出できなかった場合は『手動確認』フラグを立てること",
      ],
      requiredSubmissionItems: ["GAS コード", "テスト用画像", "結果シートのキャプチャ"],
    },
    aiReviewRubric: [
      { title: "正規表現の適切さ", description: "金額や日付の表記ゆれに対応できる柔軟な正規表現か" },
      { title: "例外処理", description: "OCR失敗やマッチしなかった場合のフェイルセーフがあるか" },
      { title: "業務価値の説明", description: "データエントリー工数削減が論理的に説明されているか" },
    ],
    mentorEvaluationSheet: {
      technicalPointLabel: "Drive API の利用と正規表現によるデータクレンジング力",
      businessPointLabel: "人間による最終確認がしやすい運用フローになっているか",
      returnReasons: [
        "金額抽出の正規表現が固定フォーマットに依存しすぎており、別レイアウトの領収書に対応できません。",
      ],
      commentTemplate:
        "非構造化データを構造化データに変換する強力な仕組みです。『AI＋人の確認』のフロー設計が素晴らしいです。",
    },
  },
  {
    id: "task-09",
    taskCode: "TASK-09",
    version: 1,
    title: "Pythonを使った「シフト・ルートの最適化アルゴリズム」",
    summary: "制約条件を満たすシフトや巡回ルートを Python で導く最適化課題。",
    category: "data_optimization",
    difficulty: 4,
    estimatedHours: 14,
    skills: { automation: 26, ai: 0, integration: 18 },
    learningObjective:
      "Python 基本文法と、数理最適化やアルゴリズム的思考の基礎を学ぶ。",
    learnerActions: [
      "Google Colab などで Python 環境を用意する",
      "シフト制約またはルート最適化の条件を定義する",
      "条件を満たす解を計算し、結果を出力する",
    ],
    deliverables: [
      "Python コード（.ipynb 等）",
      "シフト表やルート順などの実行結果",
    ],
    businessImpact:
      "時間のかかるパズル的業務を瞬時に解決し、属人的な勘やコツへの依存を減らす。",
    background: "人員配置の計算やシフト作成、訪問先のルート設定などを、担当者が「頭を活用して」複雑な条件を満たすように何時間もかけてパズルを作っています。",
    specificIssue: "特定の担当者の頭の中にしかノウハウがない「属人化」が起きており、膨大な時間がかかっています。また、条件が複雑すぎて計算ミスも発生しています。",
    finalGoal: "複雑な制約条件をプログラム（アルゴリズム）に計算させ、最適なシフトやルートを自動提案させる状態。担当者は「ゼロから考える」のではなく、「提案されたものを確認・微調整するだけ」になります。",
    recommendedDependencies: [
      { taskCode: "PYTHON-BASIC", reason: "リスト・辞書・関数の理解が前提" },
      { taskCode: "ALGORITHM-BASIC", reason: "制約条件の整理と探索の考え方が必要" },
    ],
    rubricHighlights: ["Python 基本文法", "制約条件のロジック化", "出力結果の妥当性"],
    businessValueChecks: ["属人作業脱却", "策定時間短縮", "判断品質の平準化"],
    acceptanceCriteria: {
      mustHave: [
        "辞書やリストで定義した条件を満たすシフト表や訪問順を Python スクリプトで出力すること",
      ],
      minimumErrorHandling: [
        "解が存在しない場合に無限ループせず、『条件を緩和してください』と出力して終了すること",
      ],
      requiredSubmissionItems: ["Python コード", "入力データ", "出力結果", "ロジックの簡単な解説"],
    },
    aiReviewRubric: [
      { title: "コード構造", description: "評価関数や制約チェックが独立した関数として定義されているか" },
      { title: "アルゴリズム", description: "計算量が爆発しない適切なアプローチが取られているか" },
      { title: "例外処理", description: "入力データ欠損や型エラーを事前チェックしているか" },
    ],
    mentorEvaluationSheet: {
      technicalPointLabel: "Python 基礎構文、データ構造の選択、アルゴリズム実装力",
      businessPointLabel: "人間が悩むパズル的業務を解消するメリットが理解できているか",
      returnReasons: [
        "総当たりで実装しているため、スタッフ数が少し増えただけで計算が終わりません。ロジックを見直してください。",
      ],
      commentTemplate:
        "最適化のロジックがしっかり組めています。実務では PuLP などのライブラリを使うとさらに強力になります。",
    },
  },
  {
    id: "task-10",
    taskCode: "TASK-10",
    version: 1,
    title: "GAS Webアプリ機能を用いた「日報・業務報告フォーム」",
    summary: "GAS Web アプリと HTML フロントを連携し、報告入力を統一する課題。",
    category: "internal_ops",
    difficulty: 4,
    estimatedHours: 13,
    skills: { automation: 32, ai: 0, integration: 22 },
    learningObjective:
      "HTML/CSS/JavaScript と GAS の連携、および Web アプリとしてのデプロイを理解する。",
    learnerActions: [
      "スマートフォンからでも入力しやすい HTML フォームを作成する",
      "doGet で Web アプリとして配信する",
      "google.script.run で入力データを GAS へ渡し、シートに蓄積する",
    ],
    deliverables: [
      "GAS の gs ファイルと html ファイル",
      "デプロイされた Web アプリ URL",
      "データが蓄積されたスプレッドシート",
    ],
    businessImpact:
      "紙・メール・LINE などバラバラな報告方法を統一し、手動転記ゼロで即時にデータを蓄積する。",
    background: "現場からの業務日報や進捗報告が、紙、メール、LINEなど店舗や人によってバラバラの形式で送られてきます。",
    specificIssue: "形式がバラバラなため、管理者がそれを一つのデータベース（スプレッドシート等）に手動で転記する必要があり、非常に手間がかかっています。また、報告漏れや不備の確認も大変です。",
    finalGoal: "自社専用の報告用Webアプリ（フォーム）に入力方法を統一し、送信されたデータが自動でデータベースに蓄積される状態。手動での転記作業をゼロにし、リアルタイムに現場の状況を把握できるようにします。",
    recommendedDependencies: [
      { taskCode: "HTML-BASIC", reason: "フォーム作成に必要" },
      { taskCode: "TASK-01", reason: "GAS とシート連携の基礎が役立つ" },
    ],
    rubricHighlights: ["doGet", "google.script.run", "UI の操作しやすさ"],
    businessValueChecks: ["報告方法の統一", "報告率向上", "転記作業ゼロ化"],
    acceptanceCriteria: {
      mustHave: [
        "スマホ表示対応 HTML フォームを作成し、google.script.run で GAS に送りシートへ追記すること",
      ],
      minimumErrorHandling: [
        "フロント側で必須入力チェックを行うこと",
        "サーバー側でもデータ欠損時のエラー処理を行うこと",
      ],
      requiredSubmissionItems: ["Webアプリ URL", "GAS コード（HTML/GS）", "スマホ表示時の画面キャプチャ"],
    },
    aiReviewRubric: [
      { title: "フロントとバックの連携", description: "非同期通信と成功時/失敗時コールバックが正しく実装されているか" },
      { title: "セキュリティ", description: "HTML エスケープやサニタイズが考慮されているか" },
      { title: "可読性", description: "HTML/CSS/JavaScript が整理されて記述されているか" },
    ],
    mentorEvaluationSheet: {
      technicalPointLabel: "クライアント・サーバーモデルの理解と UI 実装力",
      businessPointLabel: "現場の人がスマホからストレスなく入力できる UI/UX か",
      returnReasons: [
        "送信ボタンを連続で押せてしまうため、同じデータが複数回記録されます。送信中はボタンを無効化してください。",
      ],
      commentTemplate:
        "フルスクラッチでのフロント・バックエンド開発、お疲れ様でした。自社専用ツールをゼロから作れるスキルは非常に重宝されます。",
    },
  },
];

export const studentDashboard: DashboardMetrics = {
  completedTasks: 0,
  inReview: 0,
  recommendedTaskCode: "-",
  recommendedReason: "提出実績が蓄積されると、ここに推奨課題が表示されます。",
  skillScores: { automation: 0, ai: 0, integration: 0 },
};

export const mentorQueue: Submission[] = [];

export const learners: LearnerSnapshot[] = [];

export const mentorDrafts: Record<string, MentorReviewDraft> = {};

export const batchSummaries: BatchSummary[] = [];

export const knowledgeEntries: KnowledgeEntry[] = [];

export function getTaskByCode(taskCode: string) {
  return tasks.find((task) => task.taskCode === taskCode);
}

export function getSubmissionById(submissionId: string) {
  return mentorQueue.find((submission) => submission.id === submissionId);
}
