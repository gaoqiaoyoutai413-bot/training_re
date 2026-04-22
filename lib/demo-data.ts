import type {
  AiReviewRecord,
  DashboardMetrics,
  KnowledgeEntry,
  KnowledgeEntryDetail,
  KnowledgeTaskGroup,
  LearnerSnapshot,
  MentorReviewRecord,
  Submission,
  SubmissionDetailRecord,
  Task,
} from "@/types/domain";

const demoTasks: Task[] = [
  {
    id: "task-01",
    taskCode: "TASK-01",
    version: 1,
    title: "勤怠データの可視化ダッシュボード",
    summary: "CSV の勤怠実績を整理し、集計結果と気付きが一目で分かる管理画面を作る課題です。",
    category: "internal_ops",
    difficulty: 2,
    estimatedHours: 6,
    skills: { automation: 45, ai: 15, integration: 20 },
    learningObjective: "CSV 入力を前提に、要件整理から業務向け UI 設計までを一通り体験する。",
    learnerActions: [
      "勤怠 CSV を読み込み、必要な列を整理する",
      "欠勤・遅刻・残業の指標を集計する",
      "マネージャーが見やすいダッシュボードを設計する",
    ],
    deliverables: ["README", "モック画像", "任意のコード提出リンク"],
    businessImpact: "日々の勤怠確認を一覧化し、確認コストと見落としを減らす。",
    background: "運営側は CSV を手作業で開いて確認しており、週次レポート作成に時間がかかっていました。",
    specificIssue: "遅刻や長時間労働の兆候を早めに見つけにくい状態です。",
    finalGoal: "担当者が 5 分以内に当週の注意対象を把握できる状態を作ること。",
    starterKit: {
      title: "勤怠データスターターセット",
      description: "入力 CSV と期待する成果イメージをまとめた配布セットです。",
      setupSteps: ["CSV を確認する", "必要な指標を洗い出す", "画面モックを作る"],
      files: [
        {
          label: "attendance.csv",
          path: "/starter-kits/TASK-01/attendance.csv",
          description: "勤怠実績のサンプルデータ",
        },
      ],
    },
    recommendedDependencies: [],
    rubricHighlights: ["見やすい KPI 設計", "異常値の把握しやすさ", "README の説明力"],
    businessValueChecks: ["確認工数を減らせているか", "注意対象がひと目で分かるか"],
    acceptanceCriteria: {
      mustHave: ["出勤状況の集計", "注意対象の抽出", "一覧画面の設計"],
      minimumErrorHandling: ["CSV が空のときの表示", "想定列がない場合の説明"],
      requiredSubmissionItems: ["README", "モック画像1枚以上"],
    },
    aiReviewRubric: [
      { title: "集計ロジック", description: "必要な指標が業務文脈に沿っているか" },
      { title: "読みやすさ", description: "README と画面説明が分かりやすいか" },
    ],
    mentorEvaluationSheet: {
      technicalPointLabel: "集計設計",
      businessPointLabel: "運用での使いやすさ",
      returnReasons: ["指標の根拠不足", "画面構成が分かりづらい"],
      commentTemplate: "良かった点 / 改善点 / 次回確認したい点",
    },
  },
  {
    id: "task-08",
    taskCode: "TASK-08",
    version: 1,
    title: "請求書 OCR 支援ワークフロー",
    summary: "請求書・レシート画像から必要項目を抜き出し、確認しやすいレビュー画面を設計する課題です。",
    category: "data_optimization",
    difficulty: 3,
    estimatedHours: 8,
    skills: { automation: 35, ai: 40, integration: 35 },
    learningObjective: "OCR や AI 補助を前提にした、人が確認しやすい業務フローを設計する。",
    learnerActions: [
      "入力画像から必要項目を整理する",
      "読み取り結果の確認 UI を設計する",
      "差し戻し・修正フローを README にまとめる",
    ],
    deliverables: ["README", "モック画像", "任意の添付コード"],
    businessImpact: "手入力の負担を減らしつつ、確認品質を保つことを狙います。",
    background: "請求処理の現場では、紙や PDF からの転記作業が多く残っています。",
    specificIssue: "OCR の誤読を人が確認する工程が分散していて、差し戻し理由も残りにくい状態です。",
    finalGoal: "担当者が読み取り結果と原本を並べて確認し、5 分以内に修正可否を判断できること。",
    starterKit: {
      title: "OCR 検証セット",
      description: "帳票サンプルと期待値 CSV を含むセットです。",
      setupSteps: ["サンプル画像を確認する", "必要項目を定義する", "確認画面を設計する"],
      files: [
        {
          label: "invoice-sample-01.svg",
          path: "/starter-kits/TASK-08/invoice-sample-01.svg",
          description: "請求書サンプル",
        },
        {
          label: "receipt-sample-01.svg",
          path: "/starter-kits/TASK-08/receipt-sample-01.svg",
          description: "レシートサンプル",
        },
      ],
    },
    recommendedDependencies: [],
    rubricHighlights: ["確認導線の分かりやすさ", "誤読時の対処設計", "業務フローへの落とし込み"],
    businessValueChecks: ["転記工数を減らせるか", "誤読を見逃しにくいか"],
    acceptanceCriteria: {
      mustHave: ["項目抽出の一覧", "原本との比較表示", "修正フローの説明"],
      minimumErrorHandling: ["OCR 失敗時の扱い", "未入力項目の表示"],
      requiredSubmissionItems: ["README", "モック画像1枚以上"],
    },
    aiReviewRubric: [
      { title: "AI 活用方針", description: "AI をどこまで補助に使うかが明確か" },
      { title: "例外ケース", description: "誤読や未入力時の対応が整理されているか" },
    ],
    mentorEvaluationSheet: {
      technicalPointLabel: "情報設計",
      businessPointLabel: "現場適用性",
      returnReasons: ["確認フローが曖昧", "例外時の説明不足"],
      commentTemplate: "現場利用を想定したコメントを記入",
    },
  },
  {
    id: "task-10",
    taskCode: "TASK-10",
    version: 1,
    title: "週次レポート自動作成アシスタント",
    summary: "入力データから週次報告のドラフトを組み立て、上長確認しやすい構成にする課題です。",
    category: "knowledge_management",
    difficulty: 2,
    estimatedHours: 5,
    skills: { automation: 25, ai: 35, integration: 15 },
    learningObjective: "業務報告の定型化と AI 補助による要約体験を学ぶ。",
    learnerActions: ["報告項目を定義する", "ドラフト出力の流れを作る", "確認ポイントを README に整理する"],
    deliverables: ["README", "モック画像"],
    businessImpact: "報告文作成の時間を減らし、内容の粒度を揃える。",
    starterKit: {
      title: "レポート項目定義",
      description: "週次報告に必要な項目のサンプルです。",
      setupSteps: ["必要項目を確認する", "出力イメージを考える"],
      files: [
        {
          label: "report-fields.csv",
          path: "/starter-kits/TASK-10/report-fields.csv",
          description: "レポート項目のサンプル",
        },
      ],
    },
    recommendedDependencies: [],
    rubricHighlights: ["要約の分かりやすさ", "上長確認のしやすさ"],
    businessValueChecks: ["報告作成時間を削減できるか", "内容の抜け漏れを減らせるか"],
    acceptanceCriteria: {
      mustHave: ["週次報告のドラフト表示", "確認ポイントの整理"],
      minimumErrorHandling: ["入力不足時の案内"],
      requiredSubmissionItems: ["README", "モック画像1枚以上"],
    },
    aiReviewRubric: [
      { title: "要約品質", description: "重要情報を短くまとめられているか" },
      { title: "構成", description: "読み手が確認しやすい並びになっているか" },
    ],
    mentorEvaluationSheet: {
      technicalPointLabel: "出力設計",
      businessPointLabel: "報告品質",
      returnReasons: ["出力粒度の不足"],
      commentTemplate: "読み手に伝わる構成になっているかを中心に記載",
    },
  },
];

const demoLearners: LearnerSnapshot[] = [
  {
    id: "demo-user-001",
    name: "Demo User 001",
    email: "user.001@example.test",
    batchCode: null,
    role: "student",
    accountStatus: "active",
    assignedMentorId: "demo-mentor-001",
    assignedMentorName: "Demo Mentor 001",
    submissionCount: 2,
    completedTasks: 1,
    inReviewTasks: 1,
    skillScores: { automation: 45, ai: 20, integration: 15 },
    focusArea: "自動化を伸ばしている段階",
  },
  {
    id: "demo-user-002",
    name: "Demo User 002",
    email: "user.002@example.test",
    batchCode: null,
    role: "student",
    accountStatus: "active",
    assignedMentorId: "demo-mentor-001",
    assignedMentorName: "Demo Mentor 001",
    submissionCount: 1,
    completedTasks: 0,
    inReviewTasks: 1,
    skillScores: { automation: 20, ai: 30, integration: 20 },
    focusArea: "AI活用を伸ばしている段階",
  },
  {
    id: "demo-mentor-001",
    name: "Demo Mentor 001",
    email: "mentor.001@example.test",
    batchCode: null,
    role: "mentor",
    accountStatus: "active",
    assignedMentorId: null,
    assignedMentorName: null,
    submissionCount: 0,
    completedTasks: 0,
    inReviewTasks: 0,
    skillScores: { automation: 0, ai: 0, integration: 0 },
    focusArea: "レビュー担当",
  },
  {
    id: "demo-admin-001",
    name: "Demo Admin 001",
    email: "admin.001@example.test",
    batchCode: null,
    role: "admin",
    accountStatus: "active",
    assignedMentorId: null,
    assignedMentorName: null,
    submissionCount: 0,
    completedTasks: 0,
    inReviewTasks: 0,
    skillScores: { automation: 0, ai: 0, integration: 0 },
    focusArea: "運営管理",
  },
];

const demoAiReviewBySubmissionId: Record<string, AiReviewRecord> = {
  "submission-001": {
    modelName: "demo-model",
    promptVersion: "demo-v1",
    securityScore: 4,
    readabilityScore: 4,
    businessLogicScore: 4,
    overallAssessment: "borderline",
    assessmentReason: "全体の流れは良く整理されており、細部を詰めるとさらに良くなる提出です。",
    summary: "勤怠指標の見せ方が整理されており、README から画面意図が読み取りやすい構成です。",
    acceptanceChecks: [
      { label: "集計指標の整理", status: "met", comment: "主要 KPI が定義されています。" },
      { label: "異常値の説明", status: "partial", comment: "閾値の根拠をもう一段補足できると安心です。" },
    ],
    findings: [
      {
        severity: "low",
        category: "business_logic",
        title: "残業閾値の説明を補強したい",
        detail: "閾値設定の理由が README で短く触れられているだけです。",
        suggestion: "想定する運用ルールとセットで説明すると、レビューしやすくなります。",
      },
    ],
    mentorFlags: ["閾値の説明補足"],
    reviewedAt: "2026-04-18T10:00:00.000Z",
  },
  "submission-002": {
    modelName: "demo-model",
    promptVersion: "demo-v1",
    securityScore: 4,
    readabilityScore: 5,
    businessLogicScore: 4,
    overallAssessment: "strong",
    assessmentReason: "レビュー導線が具体的で、AI 補助の使いどころも整理されています。",
    summary: "OCR 結果と原本を並べて確認する導線が明確で、例外処理の考え方も十分に記述されています。",
    acceptanceChecks: [
      { label: "確認画面の設計", status: "met", comment: "原本比較の導線が具体的です。" },
      { label: "例外ケース", status: "met", comment: "OCR失敗時の扱いも記載されています。" },
    ],
    findings: [],
    mentorFlags: [],
    reviewedAt: "2026-04-19T15:10:00.000Z",
  },
  "submission-003": {
    modelName: "demo-model",
    promptVersion: "demo-v1",
    securityScore: 3,
    readabilityScore: 4,
    businessLogicScore: 3,
    overallAssessment: "needs_revision",
    assessmentReason: "方向性は良いですが、運用フローの説明をもう少し補う必要があります。",
    summary: "週次レポートのドラフト生成イメージは良いものの、確認工程の説明がまだ薄い状態です。",
    acceptanceChecks: [
      { label: "ドラフト生成", status: "met", comment: "出力イメージは整理されています。" },
      { label: "確認フロー", status: "partial", comment: "誰が何を確認するかをもう少し明示したいです。" },
    ],
    findings: [
      {
        severity: "medium",
        category: "business_logic",
        title: "確認責任の分担が曖昧",
        detail: "上長確認前のセルフチェック工程が明記されていません。",
        suggestion: "作成者確認と上長確認を分けて記載すると運用に乗せやすくなります。",
      },
    ],
    mentorFlags: ["確認フロー補足"],
    reviewedAt: "2026-04-20T09:20:00.000Z",
  },
};

const demoMentorReviewBySubmissionId: Record<string, MentorReviewRecord> = {
  "submission-001": {
    submissionId: "submission-001",
    technicalScore: 4,
    businessScore: 4,
    result: "passed",
    comment:
      "ダッシュボード全体の構成が見やすく、管理者がどこを見るべきかが整理されています。閾値の根拠だけ追記できるとさらに説得力が増します。",
    reviewerName: "Demo Mentor 001",
    reviewedAt: "2026-04-19T12:00:00.000Z",
  },
};

const demoSubmissions: Submission[] = [
  {
    id: "submission-001",
    taskCode: "TASK-01",
    taskTitle: "勤怠データの可視化ダッシュボード",
    userId: "demo-user-001",
    userName: "Demo User 001",
    batchCode: null,
    submittedAt: "2026-04-18T08:30:00.000Z",
    status: "passed",
    sourceCodeUrl: "https://example.test/demo-repository",
    businessValueText:
      "## 概要\n勤怠 CSV を取り込み、遅刻・欠勤・残業時間を一覧化するダッシュボードを設計しました。\n\n## 工夫した点\n- 注意対象をカードで先に表示\n- 集計根拠を README に明記\n- モック画像と数値の対応を揃えた",
    assignedMentorId: "demo-mentor-001",
    assignedMentorName: "Demo Mentor 001",
    aiSummary: demoAiReviewBySubmissionId["submission-001"].summary,
    technicalScore: 4,
    businessScore: 4,
    driveExportStatus: "exported",
    driveExportedAt: "2026-04-19T14:00:00.000Z",
    driveFolderId: null,
  },
  {
    id: "submission-002",
    taskCode: "TASK-08",
    taskTitle: "請求書 OCR 支援ワークフロー",
    userId: "demo-user-002",
    userName: "Demo User 002",
    batchCode: null,
    submittedAt: "2026-04-19T07:45:00.000Z",
    status: "ai_reviewed",
    sourceCodeUrl: "https://example.test/demo-repository",
    businessValueText:
      "## 概要\n帳票画像から読み取った項目を確認者がすぐ直せる画面フローを設計しました。\n\n## 工夫した点\n- 原本と抽出結果を左右に比較\n- 差し戻し理由をテンプレート化\n- OCR 失敗時の再処理導線を用意",
    assignedMentorId: "demo-mentor-001",
    assignedMentorName: "Demo Mentor 001",
    aiSummary: demoAiReviewBySubmissionId["submission-002"].summary,
    driveExportStatus: "pending",
  },
  {
    id: "submission-003",
    taskCode: "TASK-10",
    taskTitle: "週次レポート自動作成アシスタント",
    userId: "demo-user-001",
    userName: "Demo User 001",
    batchCode: null,
    submittedAt: "2026-04-20T10:10:00.000Z",
    status: "submitted",
    sourceCodeUrl: "",
    businessValueText:
      "## 概要\n週次報告の入力内容をもとに、ドラフトを自動で組み立てる画面を考えました。\n\n## 工夫した点\n- 今週の成果と課題を分離\n- 次週アクションを自動で末尾に整理",
    assignedMentorId: "demo-mentor-001",
    assignedMentorName: "Demo Mentor 001",
    aiSummary: "AIレビュー未実行",
    driveExportStatus: null,
  },
];

const demoSubmissionDetails: Record<string, SubmissionDetailRecord> = {
  "submission-001": {
    submission: demoSubmissions[0],
    taskTitle: demoSubmissions[0].taskTitle ?? null,
    files: [
      {
        id: "file-001",
        storagePath: "submission-001/mockup/dashboard-overview.svg",
        fileType: "mock_image",
        mimeType: "image/svg+xml",
        uploadedAt: "2026-04-18T08:35:00.000Z",
        previewUrl: "/starter-kits/TASK-08/invoice-sample-01.svg",
      },
      {
        id: "file-002",
        storagePath: "submission-001/code/readme.md",
        fileType: "code_file",
        mimeType: "text/markdown",
        uploadedAt: "2026-04-18T08:36:00.000Z",
        previewUrl: "/starter-kits/TASK-06/manual-outline.md",
      },
    ],
    aiReview: demoAiReviewBySubmissionId["submission-001"],
    mentorReview: demoMentorReviewBySubmissionId["submission-001"],
  },
  "submission-002": {
    submission: demoSubmissions[1],
    taskTitle: demoSubmissions[1].taskTitle ?? null,
    files: [
      {
        id: "file-003",
        storagePath: "submission-002/mockup/ocr-review.svg",
        fileType: "mock_image",
        mimeType: "image/svg+xml",
        uploadedAt: "2026-04-19T07:50:00.000Z",
        previewUrl: "/starter-kits/TASK-08/receipt-sample-01.svg",
      },
    ],
    aiReview: demoAiReviewBySubmissionId["submission-002"],
    mentorReview: null,
  },
  "submission-003": {
    submission: demoSubmissions[2],
    taskTitle: demoSubmissions[2].taskTitle ?? null,
    files: [
      {
        id: "file-004",
        storagePath: "submission-003/mockup/report-summary.svg",
        fileType: "mock_image",
        mimeType: "image/svg+xml",
        uploadedAt: "2026-04-20T10:11:00.000Z",
        previewUrl: "/starter-kits/TASK-08/invoice-sample-01.svg",
      },
    ],
    aiReview: null,
    mentorReview: null,
  },
};

const demoKnowledgeEntries: KnowledgeEntryDetail[] = [
  {
    id: "knowledge-001",
    submissionId: "submission-001",
    taskCode: "TASK-01",
    taskTitle: "勤怠データの可視化ダッシュボード",
    title: "管理者が毎朝見たい KPI を先に置いた構成",
    summary: "最初に注意対象を示し、その後で詳細表を見る流れにした README とモックの例です。",
    highlights: ["注意対象カード", "CSV集計", "README構成"],
    readme: demoSubmissions[0].businessValueText,
    mentorComment: demoMentorReviewBySubmissionId["submission-001"].comment,
    mentorResult: "passed",
    sourceCodeUrl: "https://example.test/demo-repository",
    publishedAt: "2026-04-20T12:00:00.000Z",
    images: [
      {
        id: "knowledge-image-001",
        url: "/starter-kits/TASK-08/invoice-sample-01.svg",
        mimeType: "image/svg+xml",
        label: "モック画像",
      },
    ],
  },
  {
    id: "knowledge-002",
    submissionId: "submission-002",
    taskCode: "TASK-08",
    taskTitle: "請求書 OCR 支援ワークフロー",
    title: "OCR 結果と原本を左右比較するレビュー画面",
    summary: "原本の見直しコストを下げるため、差分確認を最優先にした構成です。",
    highlights: ["原本比較", "差し戻し理由テンプレート"],
    readme: demoSubmissions[1].businessValueText,
    mentorComment: "差分確認の導線が明快で、業務利用イメージが伝わりやすいです。",
    mentorResult: "passed",
    sourceCodeUrl: "https://example.test/demo-repository",
    publishedAt: "2026-04-21T09:00:00.000Z",
    images: [
      {
        id: "knowledge-image-002",
        url: "/starter-kits/TASK-08/receipt-sample-01.svg",
        mimeType: "image/svg+xml",
        label: "確認モック",
      },
    ],
  },
];

export function getDemoTasks() {
  return demoTasks;
}

export function getDemoTaskByTaskCode(taskCode: string) {
  return demoTasks.find((task) => task.taskCode === taskCode) ?? null;
}

export function getDemoLearnerSnapshots() {
  return demoLearners;
}

export function getDemoAssignmentRoster() {
  return {
    learners: demoLearners.filter((item) => item.role !== "admin"),
    mentors: demoLearners
      .filter((item) => item.role === "mentor")
      .map((item) => ({ id: item.id, name: item.name, email: item.email })),
  };
}

export function getDemoSubmissionList(options?: {
  scope?: "all" | "mine" | "assigned";
  viewerProfileId?: string | null;
  search?: string;
}) {
  const scope = options?.scope ?? "all";
  let items = demoSubmissions;

  if (scope === "mine" && options?.viewerProfileId) {
    items = items.filter((item) => item.userId === options.viewerProfileId);
  }

  if (scope === "assigned" && options?.viewerProfileId) {
    items = items.filter((item) => item.assignedMentorId === options.viewerProfileId);
  }

  const normalizedSearch = options?.search?.trim().toLowerCase();
  if (!normalizedSearch) {
    return items;
  }

  return items.filter((item) =>
    [item.taskCode, item.taskTitle ?? "", item.userName, item.assignedMentorName ?? ""].some((value) =>
      value.toLowerCase().includes(normalizedSearch),
    ),
  );
}

export function getDemoSubmissionDetail(submissionId: string) {
  return demoSubmissionDetails[submissionId] ?? null;
}

export function getDemoKnowledgeEntries(): KnowledgeEntry[] {
  return demoKnowledgeEntries.map((entry) => ({
    id: entry.id,
    submissionId: entry.submissionId,
    taskCode: entry.taskCode,
    taskTitle: entry.taskTitle,
    title: entry.title,
    author: "匿名",
    summary: entry.summary,
    highlights: entry.highlights,
    sourceCodeUrl: entry.sourceCodeUrl,
    publishedAt: entry.publishedAt ?? undefined,
  }));
}

export function getDemoKnowledgeTaskGroups(): KnowledgeTaskGroup[] {
  const grouped = new Map<string, KnowledgeTaskGroup>();

  demoKnowledgeEntries.forEach((entry) => {
    const current = grouped.get(entry.taskCode);
    if (!current) {
      grouped.set(entry.taskCode, {
        taskCode: entry.taskCode,
        taskTitle: entry.taskTitle,
        entryCount: 1,
        latestPublishedAt: entry.publishedAt,
        latestSummary: entry.summary,
        highlights: entry.highlights.slice(0, 4),
      });
      return;
    }

    current.entryCount += 1;
  });

  return [...grouped.values()];
}

export function getDemoKnowledgeEntriesByTaskCode(taskCode: string) {
  return demoKnowledgeEntries.filter((entry) => entry.taskCode === taskCode);
}

export function getDemoDashboardMetrics(): DashboardMetrics {
  return {
    completedTasks: 1,
    inReview: 2,
    recommendedTaskCode: "TASK-10",
    recommendedReason: "要約と確認フローの両方を見せやすい課題として、次の候補に設定しています。",
    skillScores: {
      automation: 45,
      ai: 35,
      integration: 20,
    },
  };
}

export function getDemoAiReview(submissionId: string) {
  return demoAiReviewBySubmissionId[submissionId] ?? null;
}
