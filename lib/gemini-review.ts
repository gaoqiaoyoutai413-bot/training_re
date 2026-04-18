import type {
  AiAcceptanceCheck,
  AiReviewFinding,
  AiReviewRecord,
  SubmissionDetailRecord,
  Task,
} from "@/types/domain";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const GEMINI_MODEL = "gemini-2.5-flash";
const PROMPT_VERSION = "tech-quest-ai-review-v2-strict";
const TEXT_FILE_EXTENSIONS = [".gs", ".js", ".ts", ".tsx", ".jsx", ".py", ".html", ".css", ".json", ".md", ".txt", ".ipynb"];

function cleanJsonText(rawText: string) {
  return rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
}

function asNumber(value: unknown) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return 0;
  }
  return Math.min(5, Math.max(0, numeric));
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asOverallAssessment(value: unknown): AiReviewRecord["overallAssessment"] {
  if (value === "strong" || value === "borderline" || value === "needs_revision" || value === "major_revision") {
    return value;
  }

  return "borderline";
}

function asFindings(value: unknown): AiReviewFinding[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const candidate = item as Record<string, unknown>;
    const severity = candidate.severity;
    const category = candidate.category;
    const title = candidate.title;
    const detail = candidate.detail;
    const suggestion = candidate.suggestion;

    if (
      (severity !== "high" && severity !== "medium" && severity !== "low") ||
      (category !== "security" && category !== "readability" && category !== "business_logic") ||
      typeof title !== "string" ||
      typeof detail !== "string" ||
      typeof suggestion !== "string"
    ) {
      return [];
    }

    return [
      {
        severity,
        category,
        title,
        detail,
        suggestion,
      },
    ];
  });
}

function asAcceptanceChecks(value: unknown): AiAcceptanceCheck[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const candidate = item as Record<string, unknown>;
    const status = candidate.status;
    const label = candidate.label;
    const comment = candidate.comment;

    if (
      (status !== "met" && status !== "partial" && status !== "missing" && status !== "unclear") ||
      typeof label !== "string" ||
      typeof comment !== "string"
    ) {
      return [];
    }

    return [{ label, status, comment }];
  });
}

function parseAiReviewResponse(rawText: string): Omit<AiReviewRecord, "reviewedAt"> {
  const parsed = JSON.parse(cleanJsonText(rawText)) as Record<string, unknown>;
  const scores = (parsed.scores ?? {}) as Record<string, unknown>;

  return {
    modelName: GEMINI_MODEL,
    promptVersion: PROMPT_VERSION,
    securityScore: asNumber(scores.security),
    readabilityScore: asNumber(scores.readability),
    businessLogicScore: asNumber(scores.businessLogic),
    overallAssessment: asOverallAssessment(parsed.overallAssessment),
    assessmentReason:
      typeof parsed.assessmentReason === "string" ? parsed.assessmentReason : "AI一次レビューの評価理由は未設定です。",
    summary: typeof parsed.summary === "string" ? parsed.summary : "AIレビュー要約を生成できませんでした。",
    acceptanceChecks: asAcceptanceChecks(parsed.acceptanceChecks),
    findings: asFindings(parsed.findings),
    mentorFlags: asStringArray(parsed.mentorFlags),
  };
}

function deriveAssessment(review: Omit<AiReviewRecord, "reviewedAt">): Pick<AiReviewRecord, "overallAssessment" | "assessmentReason"> {
  const hasMissingAcceptance = review.acceptanceChecks.some((check) => check.status === "missing");
  const hasPartialAcceptance = review.acceptanceChecks.some((check) => check.status === "partial" || check.status === "unclear");
  const highSeverityCount = review.findings.filter((finding) => finding.severity === "high").length;
  const mediumSeverityCount = review.findings.filter((finding) => finding.severity === "medium").length;
  const minScore = Math.min(review.securityScore, review.readabilityScore, review.businessLogicScore);

  if (hasMissingAcceptance || highSeverityCount > 0 || minScore <= 1) {
    return {
      overallAssessment: "major_revision",
      assessmentReason: "必須要件の不足、または重大な懸念があり、そのままではレビュー通過候補にできません。",
    };
  }

  if (hasPartialAcceptance || mediumSeverityCount >= 2 || minScore <= 2) {
    return {
      overallAssessment: "needs_revision",
      assessmentReason: "提出の方向性は見えますが、要件充足や品質面で明確な追加修正が必要です。",
    };
  }

  if (review.securityScore >= 4 && review.readabilityScore >= 4 && review.businessLogicScore >= 4) {
    return {
      overallAssessment: "strong",
      assessmentReason: "主要観点で大きな懸念が少なく、メンター確認に進めやすい提出です。",
    };
  }

  return {
    overallAssessment: "borderline",
    assessmentReason: "致命的ではないものの、要件の詰めや説明不足が残っているため、メンター確認前提の提出です。",
  };
}

function applyStrictReviewPolicy(task: Task, detail: SubmissionDetailRecord, parsed: Omit<AiReviewRecord, "reviewedAt">) {
  const review = {
    ...parsed,
    acceptanceChecks: parsed.acceptanceChecks.length > 0
      ? parsed.acceptanceChecks
      : [
          ...task.acceptanceCriteria.mustHave.map((label) => ({
            label,
            status: "unclear" as const,
            comment: "提出内容から判断できませんでした。README かモック画像に実装根拠を追加してください。",
          })),
        ],
  };

  const missingAcceptanceCount = review.acceptanceChecks.filter((check) => check.status === "missing").length;
  const partialAcceptanceCount = review.acceptanceChecks.filter(
    (check) => check.status === "partial" || check.status === "unclear",
  ).length;
  const highSecurityFinding = review.findings.some(
    (finding) => finding.category === "security" && finding.severity === "high",
  );
  const mediumOrHigherReadabilityCount = review.findings.filter(
    (finding) => finding.category === "readability" && (finding.severity === "high" || finding.severity === "medium"),
  ).length;
  const businessValueTextLength = detail.submission.businessValueText.trim().length;
  const hasSourceEvidence =
    Boolean(detail.submission.sourceCodeUrl?.trim()) || detail.files.some((file) => file.fileType === "source_bundle");

  if (highSecurityFinding) {
    review.securityScore = Math.min(review.securityScore, 2);
  }

  if (mediumOrHigherReadabilityCount >= 2) {
    review.readabilityScore = Math.min(review.readabilityScore, 2);
  }

  if (missingAcceptanceCount > 0) {
    review.businessLogicScore = Math.min(review.businessLogicScore, 2);
  } else if (partialAcceptanceCount > 0) {
    review.businessLogicScore = Math.min(review.businessLogicScore, 3);
  }

  if (businessValueTextLength < 180) {
    review.businessLogicScore = Math.min(review.businessLogicScore, 2);
    if (!review.mentorFlags.includes("業務価値の説明が短く、削減工数や運用変化の根拠が弱いため要確認です。")) {
      review.mentorFlags.push("業務価値の説明が短く、削減工数や運用変化の根拠が弱いため要確認です。");
    }
  }

  if (!hasSourceEvidence) {
    review.readabilityScore = Math.min(review.readabilityScore, 2);
    review.securityScore = Math.min(review.securityScore, 2);
    if (!review.mentorFlags.includes("コード提出リンクまたはコードファイルがなく、実装品質は本文ベースの暫定評価です。")) {
      review.mentorFlags.push("コード提出リンクまたはコードファイルがなく、実装品質は本文ベースの暫定評価です。");
    }
  }

  const derivedAssessment = deriveAssessment(review);
  review.overallAssessment = derivedAssessment.overallAssessment;
  review.assessmentReason = derivedAssessment.assessmentReason;

  return review;
}

function buildPrompt(task: Task, detail: SubmissionDetailRecord) {
  return JSON.stringify(
    {
      task: {
        taskCode: task.taskCode,
        title: task.title,
        summary: task.summary,
        learningObjective: task.learningObjective,
        learnerActions: task.learnerActions,
        deliverables: task.deliverables,
        businessImpact: task.businessImpact,
        acceptanceCriteria: task.acceptanceCriteria,
        aiReviewRubric: task.aiReviewRubric,
        businessValueChecks: task.businessValueChecks,
      },
      submission: {
        sourceCodeUrl: detail.submission.sourceCodeUrl,
        businessValueText: detail.submission.businessValueText,
        evidenceFiles: detail.files.map((file) => ({
          fileType: file.fileType,
          storagePath: file.storagePath,
          mimeType: file.mimeType,
        })),
        sourceFiles: detail.files
          .filter((file) => file.fileType === "source_bundle")
          .map((file) => ({
            storagePath: file.storagePath,
            mimeType: file.mimeType,
          })),
        sourceCodeSnippets: detail.aiReview?.mentorFlags ?? [],
      },
      reviewPolicy: {
        focus: ["security", "readability", "business_logic"],
        forbidden: ["final_pass_fail_decision"],
        scoringGuide: {
          five: "要件根拠が明確で、重大な懸念がなく、そのままメンター確認に進めやすい。",
          four: "大枠は良いが、軽微な不足や説明補強が必要。",
          three: "方向性は正しいが、要件根拠・品質・業務価値説明のどこかに弱さがある。",
          two: "不足が複数あり、README・モック・コードの追記や修正が必要。",
          one: "重大な欠落や危険があり、現時点ではレビュー候補として弱い。",
          zero: "提出物から評価根拠をほぼ確認できない。",
        },
        strictRules: [
          "missing の acceptanceCheck が1つでもあれば businessLogic は2点以下にする。",
          "high severity のセキュリティ指摘があれば security は2点以下にする。",
          "コード証跡が乏しい場合は readability と security を厳しめに評価する。",
          "業務価値が定性的すぎる、または工数削減の説明が弱い場合は businessLogic を3点以下にする。",
          "4点以上は『根拠が十分で、重大な懸念が少ない』場合にだけ付ける。",
          "5点はほぼ満点であり、軽々しく付けない。",
        ],
        outputSchema: {
          overallAssessment: "strong|borderline|needs_revision|major_revision",
          assessmentReason: "string",
          summary: "string",
          scores: {
            security: "0-5",
            readability: "0-5",
            businessLogic: "0-5",
          },
          acceptanceChecks: [
            {
              label: "string",
              status: "met|partial|missing|unclear",
              comment: "string",
            },
          ],
          findings: [
            {
              severity: "high|medium|low",
              category: "security|readability|business_logic",
              title: "string",
              detail: "string",
              suggestion: "string",
            },
          ],
          mentorFlags: ["string"],
        },
      },
    },
    null,
    2,
  );
}

async function loadSourceFileContexts(detail: SubmissionDetailRecord) {
  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  const sourceFiles = detail.files
    .filter((file) => file.fileType === "source_bundle")
    .filter((file) => TEXT_FILE_EXTENSIONS.some((extension) => file.storagePath.toLowerCase().endsWith(extension)))
    .sort((left, right) => {
      const leftPriority = left.storagePath.includes("README") || left.storagePath.endsWith("package.json") ? -1 : 0;
      const rightPriority = right.storagePath.includes("README") || right.storagePath.endsWith("package.json") ? -1 : 0;
      return leftPriority - rightPriority;
    })
    .slice(0, 12);
  const contexts: Array<{ storagePath: string; content: string; note?: string }> = [];
  let totalChars = 0;

  for (const file of sourceFiles) {
    const lowerPath = file.storagePath.toLowerCase();
    const isZip = lowerPath.endsWith(".zip") || file.mimeType === "application/zip";

    if (isZip) {
      contexts.push({
        storagePath: file.storagePath,
        content: "",
        note: "zip ファイルのため本文は未展開です。ファイル構成または主要ファイルを別途確認してください。",
      });
      continue;
    }

    const { data, error } = await supabase.storage.from("submission-evidence").download(file.storagePath);

    if (error || !data) {
      contexts.push({
        storagePath: file.storagePath,
        content: "",
        note: "ファイルの読み込みに失敗しました。",
      });
      continue;
    }

    const text = await data.text();
    const remaining = Math.max(0, 40000 - totalChars);

    if (remaining <= 0) {
      break;
    }

    const trimmedText = text.slice(0, Math.min(12000, remaining));
    totalChars += trimmedText.length;
    contexts.push({
      storagePath: file.storagePath,
      content: trimmedText,
    });
  }

  return contexts;
}

export async function runGeminiAiReview(task: Task, detail: SubmissionDetailRecord) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY が設定されていません。");
  }

  const sourceContexts = await loadSourceFileContexts(detail);
  const prompt = `${buildPrompt(task, detail)}\n\n${JSON.stringify(
    {
      sourceFileContexts: sourceContexts,
    },
    null,
    2,
  )}`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text:
              "あなたは IT コンサル新人研修プラットフォームの一次レビュー AI です。最終合否は決めず、受講生への改善フィードバックとメンター補助に徹してください。出力はJSONのみで返してください。",
          },
        ],
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                "以下の課題情報と提出内容をレビューしてください。セキュリティ、可読性、ビジネス価値の3観点で採点し、改善提案を具体的に返してください。採点は甘くせず、4点以上は明確な根拠がある場合だけ付けてください。断定できない点は mentorFlags に要確認として残してください。\n\n" +
                "README / 提出内容の本文を最優先で読み、課題の必須機能・最低限のエラーハンドリング・提出物要件に対して acceptanceChecks を返してください。overallAssessment と assessmentReason には、メンター確認前の状態感を簡潔に示してください。\n\n" +
                prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API 呼び出しに失敗しました: ${response.status}`);
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
        }>;
      };
    }>;
  };

  const rawText = payload.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error("Gemini のレスポンス本文を取得できませんでした。");
  }

  const parsed = applyStrictReviewPolicy(task, detail, parseAiReviewResponse(rawText));
  const reviewedAt = new Date().toISOString();

  return {
    ...parsed,
    reviewedAt,
    rawResultJson: {
      ...parsed,
      reviewedAt,
    },
  };
}
