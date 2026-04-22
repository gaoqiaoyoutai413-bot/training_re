import {
  anonymizeAccountStatus,
  anonymizeEmail,
  anonymizeName,
} from "@/lib/demo-anonymizer";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { LearnerSnapshot, SkillScores, SubmissionStatus } from "@/types/domain";

interface ProfileRow {
  id: string;
  email: string;
  name: string;
  role: LearnerSnapshot["role"];
  account_status?: LearnerSnapshot["accountStatus"];
  assigned_mentor_id?: string | null;
}

interface SubmissionSkillRow {
  user_id: string;
  status: SubmissionStatus;
  tasks:
    | Array<{
        automation_weight: number | null;
        ai_weight: number | null;
        integration_weight: number | null;
      }>
    | {
        automation_weight: number | null;
        ai_weight: number | null;
        integration_weight: number | null;
      }
    | null;
}

function emptySkills(): SkillScores {
  return {
    automation: 0,
    ai: 0,
    integration: 0,
  };
}

function getFocusArea(skills: SkillScores) {
  const entries = [
    { key: "automation", label: "自動化", value: skills.automation },
    { key: "ai", label: "AI活用", value: skills.ai },
    { key: "integration", label: "外部連携", value: skills.integration },
  ].sort((left, right) => right.value - left.value);

  return entries[0]?.value ? `${entries[0].label}を伸ばしている段階` : "まだ提出実績はありません";
}

export async function getLearnerSnapshots(): Promise<LearnerSnapshot[]> {
  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return [];
  }

  const [{ data: profiles, error: profilesError }, { data: submissions }] = await Promise.all([
    supabase.from("profiles").select("id, email, name, role, account_status, assigned_mentor_id").order("created_at", { ascending: true }),
    supabase
      .from("submissions")
      .select("user_id, status, tasks(automation_weight, ai_weight, integration_weight)")
      .order("submitted_at", { ascending: false }),
  ]);

  if (profilesError || !profiles) {
    return [];
  }

  const statsByUserId = new Map<
    string,
    {
      submissionCount: number;
      completedTasks: number;
      inReviewTasks: number;
      skills: SkillScores;
    }
  >();

  ((submissions ?? []) as SubmissionSkillRow[]).forEach((submission) => {
    const current = statsByUserId.get(submission.user_id) ?? {
      submissionCount: 0,
      completedTasks: 0,
      inReviewTasks: 0,
      skills: emptySkills(),
    };
    const task = Array.isArray(submission.tasks) ? submission.tasks[0] : submission.tasks;

    current.submissionCount += 1;

    if (submission.status === "passed") {
      current.completedTasks += 1;
    }

    if (["submitted", "ai_reviewed", "mentor_reviewed", "rework_requested"].includes(submission.status)) {
      current.inReviewTasks += 1;
    }

    current.skills.automation += Number(task?.automation_weight ?? 0);
    current.skills.ai += Number(task?.ai_weight ?? 0);
    current.skills.integration += Number(task?.integration_weight ?? 0);

    statsByUserId.set(submission.user_id, current);
  });

  return (profiles as ProfileRow[]).map((profile) => {
    const stats = statsByUserId.get(profile.id) ?? {
      submissionCount: 0,
      completedTasks: 0,
      inReviewTasks: 0,
      skills: emptySkills(),
    };

    return {
      id: profile.id,
      name: anonymizeName({ id: profile.id, name: profile.name, email: profile.email, role: profile.role }),
      email: anonymizeEmail({ id: profile.id, name: profile.name, email: profile.email, role: profile.role }),
      batchCode: null,
      role: profile.role,
      accountStatus: anonymizeAccountStatus(profile.account_status),
      assignedMentorId: profile.assigned_mentor_id ?? null,
      assignedMentorName: null,
      submissionCount: stats.submissionCount,
      completedTasks: stats.completedTasks,
      inReviewTasks: stats.inReviewTasks,
      skillScores: {
        automation: Math.round(stats.skills.automation),
        ai: Math.round(stats.skills.ai),
        integration: Math.round(stats.skills.integration),
      },
      focusArea: getFocusArea(stats.skills),
    };
  });
}

export async function getAssignmentRoster(): Promise<{
  learners: LearnerSnapshot[];
  mentors: Array<{ id: string; name: string; email: string }>;
}> {
  const snapshots = await getLearnerSnapshots();
  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return {
      learners: snapshots.filter((item) => item.role !== "admin"),
      mentors: snapshots
        .filter((item) => item.role === "mentor")
        .map((item) => ({ id: item.id, name: item.name, email: item.email })),
    };
  }

  const mentorIds = [
    ...new Set(
      snapshots
        .map((snapshot) => snapshot.assignedMentorId)
        .filter((value): value is string => Boolean(value)),
    ),
  ];

  const { data: mentorProfiles } =
    mentorIds.length > 0
      ? await supabase.from("profiles").select("id, name, email").in("id", mentorIds)
      : { data: [] as Array<{ id: string; name: string; email: string }> };

  const assignedMentorMap = new Map((mentorProfiles ?? []).map((item) => [item.id, item]));
  const mentors = snapshots
    .filter((item) => item.role === "mentor")
    .map((item) => ({ id: item.id, name: item.name, email: item.email }));

  return {
    learners: snapshots
      .filter((item) => item.role !== "admin")
      .map((item) => ({
        ...item,
        assignedMentorName: item.assignedMentorId
          ? anonymizeName({
              id: item.assignedMentorId,
              name: assignedMentorMap.get(item.assignedMentorId)?.name ?? null,
              email: assignedMentorMap.get(item.assignedMentorId)?.email ?? null,
              role: "mentor",
            })
          : null,
      })),
    mentors,
  };
}
