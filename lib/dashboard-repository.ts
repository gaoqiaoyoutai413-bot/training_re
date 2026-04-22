import { getDemoDashboardMetrics, getDemoTasks } from "@/lib/demo-data";
import { DEMO_MODE } from "@/lib/demo-mode";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getTasks } from "@/lib/task-repository";
import type { DashboardMetrics, SkillScores, SubmissionStatus } from "@/types/domain";

interface DashboardSubmissionRow {
  status: SubmissionStatus;
  tasks:
    | {
        task_code: string | null;
        title: string | null;
        automation_weight: number | null;
        ai_weight: number | null;
        integration_weight: number | null;
      }
    | Array<{
        task_code: string | null;
        title: string | null;
        automation_weight: number | null;
        ai_weight: number | null;
        integration_weight: number | null;
      }>
    | null;
}

function emptySkillScores(): SkillScores {
  return {
    automation: 0,
    ai: 0,
    integration: 0,
  };
}

function clampSkillScores(scores: SkillScores): SkillScores {
  return {
    automation: Math.min(100, Math.max(0, Math.round(scores.automation))),
    ai: Math.min(100, Math.max(0, Math.round(scores.ai))),
    integration: Math.min(100, Math.max(0, Math.round(scores.integration))),
  };
}

export async function getDashboardMetricsForUser(profileId: string): Promise<DashboardMetrics> {
  if (DEMO_MODE) {
    return getDemoDashboardMetrics();
  }

  const supabase = createServerSupabaseClient();
  const tasks = await getTasks();

  const emptyResult: DashboardMetrics = {
    completedTasks: 0,
    inReview: 0,
    recommendedTaskCode: tasks[0]?.taskCode ?? "-",
    recommendedReason: tasks[0]
      ? "最初の提出を作ると、ここに次の推奨課題が表示されます。"
      : "公開中の課題が登録されると、ここに推奨課題が表示されます。",
    skillScores: emptySkillScores(),
  };

  if (!supabase) {
    return emptyResult;
  }

  const { data, error } = await supabase
    .from("submissions")
    .select("status, tasks(task_code, title, automation_weight, ai_weight, integration_weight)")
    .eq("user_id", profileId)
    .order("submitted_at", { ascending: false });

  if (error || !data) {
    return emptyResult;
  }

  const submissions = data as DashboardSubmissionRow[];
  const completedTasks = submissions.filter((item) => item.status === "passed").length;
  const inReview = submissions.filter((item) =>
    ["submitted", "ai_reviewed", "mentor_reviewed", "rework_requested"].includes(item.status),
  ).length;

  const skillScores = submissions.reduce<SkillScores>((current, item) => {
    if (item.status !== "passed") {
      return current;
    }

    const task = Array.isArray(item.tasks) ? item.tasks[0] : item.tasks;
    return {
      automation: current.automation + Number(task?.automation_weight ?? 0),
      ai: current.ai + Number(task?.ai_weight ?? 0),
      integration: current.integration + Number(task?.integration_weight ?? 0),
    };
  }, emptySkillScores());

  const completedTaskCodes = new Set(
    submissions
      .filter((item) => item.status === "passed")
      .map((item) => (Array.isArray(item.tasks) ? item.tasks[0]?.task_code : item.tasks?.task_code))
      .filter((value): value is string => Boolean(value)),
  );

  const nextTask = tasks.find((task) => !completedTaskCodes.has(task.taskCode)) ?? null;

  return {
    completedTasks,
    inReview,
    recommendedTaskCode: nextTask?.taskCode ?? "COMPLETE",
    recommendedReason: nextTask
      ? `${nextTask.title} が次の候補です。README とモック画像をそろえて提出すると、AIレビューとメンター評価へ進めます。`
      : "すべての公開課題に提出実績があります。次は差し戻し課題の改善やナレッジ公開を進めましょう。",
    skillScores: clampSkillScores(skillScores),
  };
}

export async function getPlatformOverviewMetrics() {
  if (DEMO_MODE) {
    return {
      taskCount: getDemoTasks().length,
      inReviewCount: 2,
      knowledgeCount: 2,
    };
  }

  const supabase = createServerSupabaseClient();
  const tasks = await getTasks();

  if (!supabase) {
    return {
      taskCount: tasks.length,
      inReviewCount: 0,
      knowledgeCount: 0,
    };
  }

  const [{ count: inReviewCount }, { count: knowledgeCount }] = await Promise.all([
    supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .in("status", ["submitted", "ai_reviewed", "mentor_reviewed", "rework_requested"]),
    supabase
      .from("knowledge_entries")
      .select("id", { count: "exact", head: true })
      .eq("is_public_within_org", true),
  ]);

  return {
    taskCount: tasks.length,
    inReviewCount: inReviewCount ?? 0,
    knowledgeCount: knowledgeCount ?? 0,
  };
}
