import { sanitizeTextForDemo, sanitizeUrlForDemo } from "@/lib/demo-anonymizer";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  KnowledgeEntry,
  KnowledgeEntryDetail,
  KnowledgeImageAsset,
  KnowledgeTaskGroup,
} from "@/types/domain";

interface KnowledgeRow {
  id: string;
  submission_id: string;
  title: string;
  summary: string;
  highlights_json?: unknown;
  published_at: string;
  knowledge_submission:
    | {
        source_code_url: string | null;
        business_value_text: string | null;
        knowledge_task: { task_code: string | null; title: string | null } | { task_code: string | null; title: string | null }[] | null;
      }
    | Array<{
        source_code_url: string | null;
        business_value_text: string | null;
        knowledge_task: { task_code: string | null; title: string | null } | { task_code: string | null; title: string | null }[] | null;
      }>
    | null;
}

interface MentorReviewRow {
  submission_id: string;
  comment: string;
  result: "passed" | "rework_requested";
}

interface SubmissionFileRow {
  id: string;
  submission_id: string;
  storage_path: string;
  file_type: string;
  mime_type: string | null;
}

function normalizeArrayValue(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => sanitizeTextForDemo(item))
    : [];
}

function mapKnowledgeRow(row: KnowledgeRow): KnowledgeEntry {
  const submission = Array.isArray(row.knowledge_submission) ? row.knowledge_submission[0] : row.knowledge_submission;
  const task = Array.isArray(submission?.knowledge_task) ? submission?.knowledge_task[0] : submission?.knowledge_task;

  return {
    id: row.id,
    submissionId: row.submission_id,
    taskCode: task?.task_code ?? "UNKNOWN",
    taskTitle: task?.title ?? null,
    title: row.title,
    author: "匿名",
    summary: sanitizeTextForDemo(row.summary),
    highlights: normalizeArrayValue(row.highlights_json),
    sourceCodeUrl: sanitizeUrlForDemo(submission?.source_code_url ?? null) || null,
    publishedAt: row.published_at,
  };
}

async function fetchKnowledgeRows() {
  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return { supabase: null, rows: [] as KnowledgeRow[] };
  }

  const { data, error } = await supabase
    .from("knowledge_entries")
    .select(
      "id, submission_id, title, summary, highlights_json, published_at, knowledge_submission:submissions!knowledge_entries_submission_id_fkey(source_code_url, business_value_text, knowledge_task:tasks!submissions_task_id_fkey(task_code, title))",
    )
    .eq("is_public_within_org", true)
    .order("published_at", { ascending: false });

  if (error || !data) {
    return { supabase, rows: [] as KnowledgeRow[] };
  }

  return { supabase, rows: data as KnowledgeRow[] };
}

async function buildSignedImageAssets(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  files: SubmissionFileRow[],
): Promise<Map<string, KnowledgeImageAsset[]>> {
  const result = new Map<string, KnowledgeImageAsset[]>();

  if (!supabase || files.length === 0) {
    return result;
  }

  for (const file of files) {
    const mimeType = file.mime_type ?? "";
    const lowerPath = file.storage_path.toLowerCase();
    const isImage = mimeType.startsWith("image/") || [".png", ".jpg", ".jpeg", ".webp", ".gif"].some((ext) => lowerPath.endsWith(ext));

    if (!isImage) {
      continue;
    }

    const { data } = await supabase.storage.from("submission-evidence").createSignedUrl(file.storage_path, 60 * 60);

    if (!data?.signedUrl) {
      continue;
    }

    const current = result.get(file.submission_id) ?? [];
    current.push({
      id: file.id,
      url: data.signedUrl,
      mimeType: file.mime_type,
      label: file.file_type,
    });
    result.set(file.submission_id, current);
  }

  return result;
}

export async function getKnowledgeEntries(): Promise<KnowledgeEntry[]> {
  const { rows } = await fetchKnowledgeRows();

  if (rows.length === 0) {
    return [];
  }

  return rows.map(mapKnowledgeRow);
}

export async function getKnowledgeTaskGroups(): Promise<KnowledgeTaskGroup[]> {
  const entries = await getKnowledgeEntries();

  if (entries.length === 0) {
    return [];
  }

  const grouped = new Map<string, KnowledgeTaskGroup>();

  for (const entry of entries) {
    const current = grouped.get(entry.taskCode);
    if (!current) {
      grouped.set(entry.taskCode, {
        taskCode: entry.taskCode,
        taskTitle: entry.taskTitle ?? null,
        entryCount: 1,
        latestPublishedAt: entry.publishedAt ?? null,
        latestSummary: entry.summary,
        highlights: entry.highlights.slice(0, 3),
      });
      continue;
    }

    current.entryCount += 1;
    if (!current.latestPublishedAt || (entry.publishedAt && new Date(entry.publishedAt).getTime() > new Date(current.latestPublishedAt).getTime())) {
      current.latestPublishedAt = entry.publishedAt ?? null;
      current.latestSummary = entry.summary;
    }

    const mergedHighlights = [...current.highlights, ...entry.highlights].filter(Boolean);
    current.highlights = [...new Set(mergedHighlights)].slice(0, 4);
  }

  return [...grouped.values()].sort((left, right) => {
    if (!left.latestPublishedAt) return 1;
    if (!right.latestPublishedAt) return -1;
    return new Date(right.latestPublishedAt).getTime() - new Date(left.latestPublishedAt).getTime();
  });
}

export async function getKnowledgeEntriesByTaskCode(taskCode: string): Promise<KnowledgeEntryDetail[]> {
  const { supabase, rows } = await fetchKnowledgeRows();

  if (!supabase || rows.length === 0) {
    return [];
  }

  const filteredRows = rows.filter((row) => {
    const submission = Array.isArray(row.knowledge_submission) ? row.knowledge_submission[0] : row.knowledge_submission;
    const task = Array.isArray(submission?.knowledge_task) ? submission?.knowledge_task[0] : submission?.knowledge_task;
    return task?.task_code === taskCode;
  });

  if (filteredRows.length === 0) {
    return [];
  }

  const submissionIds = filteredRows.map((row) => row.submission_id);

  const [{ data: mentorReviews }, { data: files }] = await Promise.all([
    supabase
      .from("mentor_reviews")
      .select("submission_id, comment, result")
      .in("submission_id", submissionIds),
    supabase
      .from("submission_files")
      .select("id, submission_id, storage_path, file_type, mime_type")
      .in("submission_id", submissionIds),
  ]);

  const reviewMap = new Map<string, MentorReviewRow>(
    ((mentorReviews ?? []) as MentorReviewRow[]).map((row) => [row.submission_id, row]),
  );
  const imageMap = await buildSignedImageAssets(supabase, (files ?? []) as SubmissionFileRow[]);

  return filteredRows.map((row) => {
    const base = mapKnowledgeRow(row);
    const submission = Array.isArray(row.knowledge_submission) ? row.knowledge_submission[0] : row.knowledge_submission;
    const review = reviewMap.get(row.submission_id);

    return {
      id: row.id,
      submissionId: row.submission_id,
      taskCode: base.taskCode,
      taskTitle: base.taskTitle ?? null,
      title: base.title,
      summary: base.summary,
      highlights: base.highlights,
      readme: sanitizeTextForDemo(submission?.business_value_text ?? ""),
      mentorComment: review?.comment ? sanitizeTextForDemo(review.comment) : null,
      mentorResult: review?.result ?? null,
      sourceCodeUrl: sanitizeUrlForDemo(submission?.source_code_url ?? null) || null,
      publishedAt: row.published_at ?? null,
      images: imageMap.get(row.submission_id) ?? [],
    };
  });
}
