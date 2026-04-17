import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  AiReviewRecord,
  MentorReviewRecord,
  Submission,
  SubmissionDetailRecord,
  SubmissionFileRecord,
} from "@/types/domain";

interface SubmissionBaseRow {
  id: string;
  task_id: string;
  task_version: number;
  user_id: string;
  assigned_mentor_id: string | null;
  status: Submission["status"];
  source_code_url: string;
  business_value_text: string;
  submitted_at: string;
}

interface ProfileRow {
  id: string;
  name: string | null;
  assigned_mentor_id?: string | null;
}

interface TaskRow {
  id: string;
  task_code: string | null;
  title: string | null;
}

interface AiReviewListRow {
  submission_id: string;
  summary: string | null;
  reviewed_at: string;
}

interface SubmissionFileRow {
  id: string;
  storage_path: string;
  file_type: string;
  mime_type: string | null;
  uploaded_at: string;
}

interface MentorReviewRow {
  reviewer_id: string;
  technical_score: number;
  business_score: number;
  comment: string;
  result: "passed" | "rework_requested";
  reviewed_at: string;
}

interface AiReviewRow {
  model_name: string;
  prompt_version: string;
  security_score: number | null;
  readability_score: number | null;
  business_logic_score: number | null;
  summary: string | null;
  raw_result_json: Record<string, unknown> | null;
  reviewed_at: string;
}

type SubmissionListOptions = {
  viewerProfileId?: string | null;
  scope?: "all" | "mine" | "assigned";
  search?: string;
};

function mapSubmissionFileRow(row: SubmissionFileRow): SubmissionFileRecord {
  return {
    id: row.id,
    storagePath: row.storage_path,
    fileType: row.file_type,
    mimeType: row.mime_type,
    uploadedAt: row.uploaded_at,
    previewUrl: null,
  };
}

function mapMentorReviewRow(submissionId: string, row: MentorReviewRow, reviewerName: string | null): MentorReviewRecord {
  return {
    submissionId,
    technicalScore: row.technical_score,
    businessScore: row.business_score,
    comment: row.comment,
    result: row.result,
    reviewerName: reviewerName ?? "未設定",
    reviewedAt: row.reviewed_at,
  };
}

function mapAiReviewRow(row: AiReviewRow): AiReviewRecord {
  const raw = row.raw_result_json ?? {};
  const findings = Array.isArray(raw.findings) ? raw.findings : [];
  const mentorFlags = Array.isArray(raw.mentorFlags) ? raw.mentorFlags.filter((item): item is string => typeof item === "string") : [];

  return {
    modelName: row.model_name,
    promptVersion: row.prompt_version,
    securityScore: Number(row.security_score ?? 0),
    readabilityScore: Number(row.readability_score ?? 0),
    businessLogicScore: Number(row.business_logic_score ?? 0),
    summary: row.summary ?? "AIレビュー未実行",
    acceptanceChecks: Array.isArray(raw.acceptanceChecks)
      ? raw.acceptanceChecks.flatMap((item) => {
          if (!item || typeof item !== "object") {
            return [];
          }
          const candidate = item as Record<string, unknown>;
          if (
            (candidate.status !== "met" &&
              candidate.status !== "partial" &&
              candidate.status !== "missing" &&
              candidate.status !== "unclear") ||
            typeof candidate.label !== "string" ||
            typeof candidate.comment !== "string"
          ) {
            return [];
          }
          return [
            {
              label: candidate.label,
              status: candidate.status,
              comment: candidate.comment,
            },
          ];
        })
      : [],
    findings: findings.flatMap((item) => {
      if (!item || typeof item !== "object") {
        return [];
      }
      const candidate = item as Record<string, unknown>;
      if (
        (candidate.severity !== "high" && candidate.severity !== "medium" && candidate.severity !== "low") ||
        (candidate.category !== "security" &&
          candidate.category !== "readability" &&
          candidate.category !== "business_logic") ||
        typeof candidate.title !== "string" ||
        typeof candidate.detail !== "string" ||
        typeof candidate.suggestion !== "string"
      ) {
        return [];
      }
      return [
        {
          severity: candidate.severity,
          category: candidate.category,
          title: candidate.title,
          detail: candidate.detail,
          suggestion: candidate.suggestion,
        },
      ];
    }),
    mentorFlags,
    reviewedAt: row.reviewed_at,
  };
}

async function fetchProfiles(ids: string[]) {
  const supabase = createServerSupabaseClient();

  if (!supabase || ids.length === 0) {
    return new Map<string, ProfileRow>();
  }

  const uniqueIds = [...new Set(ids.filter(Boolean))];

  const primaryResult = await supabase
    .from("profiles")
    .select("id, name, assigned_mentor_id")
    .in("id", uniqueIds);
  let data: ProfileRow[] | null = primaryResult.data as ProfileRow[] | null;
  let error = primaryResult.error;

  if (error) {
    const fallbackResult = await supabase
      .from("profiles")
      .select("id, name")
      .in("id", uniqueIds);
    data = (fallbackResult.data ?? []) as ProfileRow[];
    error = fallbackResult.error;
  }

  if (error || !data) {
    return new Map<string, ProfileRow>();
  }

  return new Map((data as ProfileRow[]).map((row) => [row.id, row]));
}

async function assembleSubmissions(baseRows: SubmissionBaseRow[]) {
  const supabase = createServerSupabaseClient();

  if (!supabase || baseRows.length === 0) {
    return [] as Submission[];
  }

  const submissionIds = baseRows.map((row) => row.id);
  const taskIds = [...new Set(baseRows.map((row) => row.task_id).filter(Boolean))];
  const learnerIds = [...new Set(baseRows.map((row) => row.user_id).filter(Boolean))];

  const [taskResult, profileMap, aiReviewResult] = await Promise.all([
    taskIds.length > 0
      ? supabase.from("tasks").select("id, task_code, title").in("id", taskIds)
      : Promise.resolve({ data: [], error: null }),
    fetchProfiles(learnerIds),
    submissionIds.length > 0
      ? supabase
          .from("ai_reviews")
          .select("submission_id, summary, reviewed_at")
          .in("submission_id", submissionIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const taskMap = new Map(((taskResult.data ?? []) as TaskRow[]).map((row) => [row.id, row]));

  const mentorIds = [
    ...new Set(
      baseRows
        .flatMap((row) => {
          const learnerProfile = profileMap.get(row.user_id);
          return [learnerProfile?.assigned_mentor_id ?? null, row.assigned_mentor_id ?? null];
        })
        .filter((value): value is string => Boolean(value)),
    ),
  ];
  const mentorMap = await fetchProfiles(mentorIds);

  const latestAiReviewMap = new Map<string, AiReviewListRow>();
  for (const row of (aiReviewResult.data ?? []) as AiReviewListRow[]) {
    const current = latestAiReviewMap.get(row.submission_id);
    if (!current || new Date(row.reviewed_at).getTime() > new Date(current.reviewed_at).getTime()) {
      latestAiReviewMap.set(row.submission_id, row);
    }
  }

  return baseRows.map((row) => {
    const learnerProfile = profileMap.get(row.user_id);
    const assignedMentorId = learnerProfile?.assigned_mentor_id ?? row.assigned_mentor_id ?? null;
    const assignedMentor = assignedMentorId ? mentorMap.get(assignedMentorId) : null;
    const task = taskMap.get(row.task_id);
    const aiReview = latestAiReviewMap.get(row.id);

    return {
      id: row.id,
      taskCode: task?.task_code ?? "UNKNOWN",
      taskTitle: task?.title ?? null,
      userId: row.user_id,
      userName: learnerProfile?.name ?? "未設定",
      batchCode: null,
      submittedAt: row.submitted_at,
      status: row.status,
      sourceCodeUrl: row.source_code_url,
      businessValueText: row.business_value_text,
      assignedMentorId,
      assignedMentorName: assignedMentor?.name ?? null,
      aiSummary: aiReview?.summary ?? "AIレビュー未実行",
    } satisfies Submission;
  });
}

export async function getSubmissionList(options: SubmissionListOptions = {}) {
  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  let query = supabase
    .from("submissions")
    .select("id, task_id, task_version, user_id, assigned_mentor_id, status, source_code_url, business_value_text, submitted_at")
    .order("submitted_at", { ascending: false });

  if (options.scope === "mine" && options.viewerProfileId) {
    query = query.eq("user_id", options.viewerProfileId);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("Failed to load submissions:", error);
    return [];
  }

  const mapped = await assembleSubmissions(data as SubmissionBaseRow[]);

  const scoped =
    options.scope === "assigned" && options.viewerProfileId
      ? mapped.filter((submission) => submission.assignedMentorId === options.viewerProfileId)
      : mapped;

  const normalizedSearch = options.search?.trim().toLowerCase();

  if (!normalizedSearch) {
    return scoped;
  }

  return scoped.filter((submission) => {
    const haystacks = [
      submission.userName,
      submission.taskCode,
      submission.taskTitle ?? "",
      submission.assignedMentorName ?? "",
    ];
    return haystacks.some((value) => value.toLowerCase().includes(normalizedSearch));
  });
}

export async function getSubmissionDetail(submissionId: string): Promise<SubmissionDetailRecord | null> {
  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data: submissionRow, error: submissionError } = await supabase
    .from("submissions")
    .select("id, task_id, task_version, user_id, assigned_mentor_id, status, source_code_url, business_value_text, submitted_at")
    .eq("id", submissionId)
    .maybeSingle();

  if (submissionError || !submissionRow) {
    console.error("Failed to load submission detail:", submissionError);
    return null;
  }

  const [submission] = await assembleSubmissions([submissionRow as SubmissionBaseRow]);

  if (!submission) {
    return null;
  }

  const [filesResult, aiReviewResult, mentorReviewResult, taskResult] = await Promise.all([
    supabase
      .from("submission_files")
      .select("id, storage_path, file_type, mime_type, uploaded_at")
      .eq("submission_id", submissionId)
      .order("uploaded_at", { ascending: false }),
    supabase
      .from("ai_reviews")
      .select("model_name, prompt_version, security_score, readability_score, business_logic_score, summary, raw_result_json, reviewed_at")
      .eq("submission_id", submissionId)
      .maybeSingle(),
    supabase
      .from("mentor_reviews")
      .select("reviewer_id, technical_score, business_score, comment, result, reviewed_at")
      .eq("submission_id", submissionId)
      .maybeSingle(),
    supabase
      .from("tasks")
      .select("title")
      .eq("id", (submissionRow as SubmissionBaseRow).task_id)
      .maybeSingle(),
  ]);

  let mentorReview: MentorReviewRecord | null = null;
  if (mentorReviewResult.data) {
    const reviewerMap = await fetchProfiles([mentorReviewResult.data.reviewer_id]);
    mentorReview = mapMentorReviewRow(
      submissionId,
      mentorReviewResult.data as MentorReviewRow,
      reviewerMap.get(mentorReviewResult.data.reviewer_id)?.name ?? null,
    );
  }

  const mappedFiles = ((filesResult.data ?? []) as SubmissionFileRow[]).map(mapSubmissionFileRow);
  const signedUrlResult =
    mappedFiles.length > 0
      ? await supabase.storage
          .from("submission-evidence")
          .createSignedUrls(
            mappedFiles.map((file) => file.storagePath),
            60 * 60,
          )
      : { data: [], error: null };

  const signedUrlMap = new Map(
    (signedUrlResult.data ?? []).map((item) => [item.path, item.signedUrl ?? null]),
  );

  return {
    submission,
    taskTitle: taskResult.data?.title ?? submission.taskTitle ?? null,
    files: mappedFiles.map((file) => ({
      ...file,
      previewUrl: signedUrlMap.get(file.storagePath) ?? null,
    })),
    aiReview: aiReviewResult.data ? mapAiReviewRow(aiReviewResult.data as AiReviewRow) : null,
    mentorReview,
  };
}
