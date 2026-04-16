import { NextResponse } from "next/server";
import { getMentorDraftBySubmissionId, getSubmissionDetail } from "@/lib/submission-repository";
import { getAuthorizedProfile } from "@/lib/server-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const detail = await getSubmissionDetail(id);

  if (!detail) {
    return NextResponse.json({ message: "Submission not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...detail,
    mentorDraft: getMentorDraftBySubmissionId(id),
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authorized = await getAuthorizedProfile(request, ["mentor", "admin"]);

  if (authorized.error || !authorized.profile) {
    return NextResponse.json({ message: authorized.error ?? "認証に失敗しました。" }, { status: authorized.status });
  }

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ message: "Supabase 接続情報が不足しています。" }, { status: 500 });
  }

  const { id } = await params;
  const body = (await request.json()) as { action?: string; assignedMentorId?: string | null };
  const action = String(body.action ?? "").trim();
  const requestedMentorId = typeof body.assignedMentorId === "string" ? body.assignedMentorId : null;

  type SubmissionAssignmentRow =
    | {
        id: string;
        user_id: string;
        learner_profile: { assigned_mentor_id: string | null }[] | { assigned_mentor_id: string | null } | null;
      }
    | {
        id: string;
        user_id: string;
        assigned_mentor_id: string | null;
      };

  const primaryResult = await supabase
    .from("submissions")
    .select("id, user_id, learner_profile:profiles!submissions_user_id_fkey(assigned_mentor_id)")
    .eq("id", id)
    .maybeSingle();
  let submission: SubmissionAssignmentRow | null = primaryResult.data as SubmissionAssignmentRow | null;
  let submissionError = primaryResult.error;

  if (submissionError) {
    const fallbackResult = await supabase
      .from("submissions")
      .select("id, user_id, assigned_mentor_id")
      .eq("id", id)
      .maybeSingle();
    submission = fallbackResult.data as SubmissionAssignmentRow | null;
    submissionError = fallbackResult.error;
  }

  if (submissionError || !submission) {
    return NextResponse.json({ message: "対象の提出が見つかりません。" }, { status: 404 });
  }

  const typedSubmission = submission as SubmissionAssignmentRow;
  const learnerProfile =
    "learner_profile" in typedSubmission
      ? Array.isArray(typedSubmission.learner_profile)
        ? typedSubmission.learner_profile[0]
        : typedSubmission.learner_profile
      : null;
  let nextAssignedMentorId: string | null =
    learnerProfile?.assigned_mentor_id ??
    ("assigned_mentor_id" in typedSubmission ? typedSubmission.assigned_mentor_id ?? null : null);

  if (action === "assign_self") {
    if (nextAssignedMentorId && nextAssignedMentorId !== authorized.profile.id && authorized.profile.role !== "admin") {
      return NextResponse.json({ message: "すでに別のメンターが担当しています。" }, { status: 409 });
    }
    nextAssignedMentorId = authorized.profile.id;
  } else if (action === "clear_assignment" && (authorized.profile.role === "admin" || nextAssignedMentorId === authorized.profile.id)) {
    nextAssignedMentorId = null;
  } else if (action === "set_assigned_mentor" && authorized.profile.role === "admin") {
    nextAssignedMentorId = requestedMentorId;
  } else {
    return NextResponse.json({ message: "更新内容が不正です。" }, { status: 400 });
  }

  if (
    authorized.profile.role === "mentor" &&
    nextAssignedMentorId !== null &&
    nextAssignedMentorId !== authorized.profile.id
  ) {
    return NextResponse.json({ message: "他メンターへの担当変更はできません。" }, { status: 403 });
  }

  const profileUpdate = await supabase
    .from("profiles")
    .update({ assigned_mentor_id: nextAssignedMentorId })
    .eq("id", typedSubmission.user_id);

  if (profileUpdate.error) {
    await supabase.from("submissions").update({ assigned_mentor_id: nextAssignedMentorId }).eq("user_id", typedSubmission.user_id);
  } else {
    await supabase.from("submissions").update({ assigned_mentor_id: nextAssignedMentorId }).eq("user_id", typedSubmission.user_id);
  }

  return NextResponse.json({
    message: nextAssignedMentorId ? "受講生の担当メンターを更新しました。" : "受講生の担当メンターを解除しました。",
    assignedMentorId: nextAssignedMentorId,
  });
}
