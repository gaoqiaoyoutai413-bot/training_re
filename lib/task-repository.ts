import { createServerSupabaseClient } from "@/lib/supabase/server";
import { taskStarterKits } from "@/lib/task-starter-kits";
import type {
  AcceptanceCriteria,
  AiReviewCriterion,
  MentorEvaluationSheet,
  Task,
  TaskCategory,
} from "@/types/domain";

interface TaskRow {
  id: string;
  task_code: string;
  version: number;
  title: string;
  summary: string;
  description_md: string | null;
  category: string;
  difficulty: number;
  estimated_hours: number | null;
  automation_weight: number;
  ai_weight: number;
  integration_weight: number;
  learning_objective: string | null;
  learner_actions_json: unknown;
  deliverables_json: unknown;
  review_rubric_json: unknown;
  business_value_checks_json: unknown;
  acceptance_criteria_json: unknown;
  ai_review_rubric_json: unknown;
  mentor_evaluation_sheet_json: unknown;
  background: string | null;
  specific_issue: string | null;
  final_goal: string | null;
  starter_kit_title: string | null;
  starter_kit_description: string | null;
  starter_kit_steps_json: unknown;
  starter_kit_files_json: unknown;
}

export interface TaskUpdateInput {
  title: string;
  summary: string;
  learningObjective: string;
  businessImpact: string;
  background: string;
  specificIssue: string;
  finalGoal: string;
  learnerActions: string[];
  deliverables: string[];
  businessValueChecks: string[];
  acceptanceCriteria: AcceptanceCriteria;
  aiReviewRubric: AiReviewCriterion[];
  starterKitTitle: string;
  starterKitDescription: string;
  starterKitSetupSteps: string[];
  starterKitFiles: Array<{
    label: string;
    path: string;
    description: string;
  }>;
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asAcceptanceCriteria(value: unknown): AcceptanceCriteria {
  if (!value || typeof value !== "object") {
    return {
      mustHave: [],
      minimumErrorHandling: [],
      requiredSubmissionItems: [],
    };
  }

  const candidate = value as Record<string, unknown>;

  return {
    mustHave: asStringArray(candidate.mustHave),
    minimumErrorHandling: asStringArray(candidate.minimumErrorHandling),
    requiredSubmissionItems: asStringArray(candidate.requiredSubmissionItems),
  };
}

function asAiReviewRubric(value: unknown): AiReviewCriterion[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const candidate = item as Record<string, unknown>;

    if (typeof candidate.title !== "string" || typeof candidate.description !== "string") {
      return [];
    }

    return [{ title: candidate.title, description: candidate.description }];
  });
}

function asStarterKitFiles(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const candidate = item as Record<string, unknown>;

    if (
      typeof candidate.label !== "string" ||
      typeof candidate.path !== "string" ||
      typeof candidate.description !== "string"
    ) {
      return [];
    }

    return [
      {
        label: candidate.label,
        path: candidate.path,
        description: candidate.description,
      },
    ];
  });
}

function asMentorEvaluationSheet(value: unknown): MentorEvaluationSheet {
  if (!value || typeof value !== "object") {
    return {
      technicalPointLabel: "",
      businessPointLabel: "",
      returnReasons: [],
      commentTemplate: "",
    };
  }

  const candidate = value as Record<string, unknown>;

  return {
    technicalPointLabel:
      typeof candidate.technicalPointLabel === "string" ? candidate.technicalPointLabel : "",
    businessPointLabel:
      typeof candidate.businessPointLabel === "string" ? candidate.businessPointLabel : "",
    returnReasons: asStringArray(candidate.returnReasons),
    commentTemplate: typeof candidate.commentTemplate === "string" ? candidate.commentTemplate : "",
  };
}

function mapTaskRow(row: TaskRow): Task {
  const defaultStarterKit = taskStarterKits[row.task_code];
  const starterKitTitle = row.starter_kit_title ?? defaultStarterKit?.title ?? "";
  const starterKitDescription = row.starter_kit_description ?? defaultStarterKit?.description ?? "";
  const starterKitSetupSteps = asStringArray(row.starter_kit_steps_json);
  const starterKitFiles = asStarterKitFiles(row.starter_kit_files_json);
  const starterKit =
    starterKitTitle || starterKitDescription || starterKitSetupSteps.length > 0 || starterKitFiles.length > 0
      ? {
          title: starterKitTitle,
          description: starterKitDescription,
          setupSteps: starterKitSetupSteps.length > 0 ? starterKitSetupSteps : defaultStarterKit?.setupSteps ?? [],
          files: starterKitFiles.length > 0 ? starterKitFiles : defaultStarterKit?.files ?? [],
        }
      : defaultStarterKit;

  return {
    id: row.id,
    taskCode: row.task_code,
    version: row.version,
    title: row.title,
    summary: row.summary,
    category: row.category as TaskCategory,
    difficulty: row.difficulty as 1 | 2 | 3 | 4,
    estimatedHours: row.estimated_hours ?? 0,
    skills: {
      automation: Number(row.automation_weight ?? 0),
      ai: Number(row.ai_weight ?? 0),
      integration: Number(row.integration_weight ?? 0),
    },
    learningObjective: row.learning_objective ?? "",
    learnerActions: asStringArray(row.learner_actions_json),
    deliverables: asStringArray(row.deliverables_json),
    businessImpact: row.description_md ?? row.summary,
    background: row.background ?? undefined,
    specificIssue: row.specific_issue ?? undefined,
    finalGoal: row.final_goal ?? undefined,
    starterKit,
    recommendedDependencies: [],
    rubricHighlights: asStringArray(row.review_rubric_json),
    businessValueChecks: asStringArray(row.business_value_checks_json),
    acceptanceCriteria: asAcceptanceCriteria(row.acceptance_criteria_json),
    aiReviewRubric: asAiReviewRubric(row.ai_review_rubric_json),
    mentorEvaluationSheet: asMentorEvaluationSheet(row.mentor_evaluation_sheet_json),
  };
}

export async function getTasks() {
  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("tasks")
    .select(
      "id, task_code, version, title, summary, description_md, category, difficulty, estimated_hours, automation_weight, ai_weight, integration_weight, learning_objective, learner_actions_json, deliverables_json, review_rubric_json, business_value_checks_json, acceptance_criteria_json, ai_review_rubric_json, mentor_evaluation_sheet_json, background, specific_issue, final_goal, starter_kit_title, starter_kit_description, starter_kit_steps_json, starter_kit_files_json",
    )
    .eq("is_active", true)
    .order("task_code", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as TaskRow[]).map(mapTaskRow);
}

export async function getTaskByTaskCode(taskCode: string) {
  const taskList = await getTasks();
  return taskList.find((task) => task.taskCode === taskCode) ?? null;
}

export async function updateTaskByTaskCode(taskCode: string, input: TaskUpdateInput) {
  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return { error: "Supabase 接続情報が不足しています。" };
  }

  const { error } = await supabase
    .from("tasks")
    .update({
      title: input.title,
      summary: input.summary,
      description_md: input.businessImpact,
      learning_objective: input.learningObjective,
      background: input.background,
      specific_issue: input.specificIssue,
      final_goal: input.finalGoal,
      learner_actions_json: input.learnerActions,
      deliverables_json: input.deliverables,
      business_value_checks_json: input.businessValueChecks,
      acceptance_criteria_json: input.acceptanceCriteria,
      ai_review_rubric_json: input.aiReviewRubric,
      starter_kit_title: input.starterKitTitle,
      starter_kit_description: input.starterKitDescription,
      starter_kit_steps_json: input.starterKitSetupSteps,
      starter_kit_files_json: input.starterKitFiles,
    })
    .eq("task_code", taskCode)
    .eq("is_active", true);

  if (error) {
    return { error: "課題更新に失敗しました。" };
  }

  return { error: null };
}
