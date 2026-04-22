import { NextResponse } from "next/server";
import { DEMO_MODE } from "@/lib/demo-mode";
import { getAssignmentRoster } from "@/lib/learner-repository";
import { getAuthorizedProfile } from "@/lib/server-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const authorized = await getAuthorizedProfile(request, ["mentor", "admin"]);

  if (authorized.error || !authorized.profile) {
    return NextResponse.json({ message: authorized.error ?? "認証に失敗しました。" }, { status: authorized.status });
  }

  const result = await getAssignmentRoster();
  return NextResponse.json(result);
}

export async function PATCH(request: Request) {
  const authorized = await getAuthorizedProfile(request, ["mentor", "admin"]);

  if (authorized.error || !authorized.profile) {
    return NextResponse.json({ message: authorized.error ?? "認証に失敗しました。" }, { status: authorized.status });
  }

  if (DEMO_MODE) {
    const body = (await request.json()) as { assignedMentorId?: string | null };
    return NextResponse.json({
      message: "デモモードのため、担当更新は画面表示のみです。",
      assignedMentorId: body.assignedMentorId ?? authorized.profile.id ?? null,
    });
  }

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ message: "Supabase 接続情報が不足しています。" }, { status: 500 });
  }

  const body = (await request.json()) as {
    userId?: string;
    action?: "assign_self" | "set_assigned_mentor" | "clear_assignment";
    assignedMentorId?: string | null;
  };

  const userId = String(body.userId ?? "").trim();
  const action = String(body.action ?? "").trim();
  const requestedMentorId = typeof body.assignedMentorId === "string" ? body.assignedMentorId : null;

  if (!userId || !action) {
    return NextResponse.json({ message: "更新内容が不正です。" }, { status: 400 });
  }

  const { data: targetUser, error: targetError } = await supabase
    .from("profiles")
    .select("id, role, assigned_mentor_id")
    .eq("id", userId)
    .maybeSingle();

  if (targetError || !targetUser) {
    return NextResponse.json({ message: "対象ユーザーが見つかりません。" }, { status: 404 });
  }

  if (targetUser.role === "admin") {
    return NextResponse.json({ message: "管理者には担当を設定できません。" }, { status: 400 });
  }

  let nextAssignedMentorId: string | null = targetUser.assigned_mentor_id ?? null;

  if (action === "assign_self") {
    if (authorized.profile.role !== "mentor") {
      return NextResponse.json({ message: "この操作を実行する権限がありません。" }, { status: 403 });
    }
    if (nextAssignedMentorId && nextAssignedMentorId !== authorized.profile.id) {
      return NextResponse.json({ message: "すでに別のメンターが担当しています。" }, { status: 409 });
    }
    nextAssignedMentorId = authorized.profile.id;
  } else if (action === "clear_assignment") {
    if (authorized.profile.role === "mentor" && nextAssignedMentorId !== authorized.profile.id) {
      return NextResponse.json({ message: "自分が担当しているユーザーのみ解除できます。" }, { status: 403 });
    }
    nextAssignedMentorId = null;
  } else if (action === "set_assigned_mentor") {
    if (authorized.profile.role !== "admin") {
      return NextResponse.json({ message: "この操作を実行する権限がありません。" }, { status: 403 });
    }

    if (requestedMentorId) {
      const { data: mentorProfile, error: mentorError } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", requestedMentorId)
        .maybeSingle();

      if (mentorError || !mentorProfile || mentorProfile.role !== "mentor") {
        return NextResponse.json({ message: "割り当て先メンターが不正です。" }, { status: 400 });
      }
    }

    nextAssignedMentorId = requestedMentorId;
  } else {
    return NextResponse.json({ message: "更新内容が不正です。" }, { status: 400 });
  }

  const { error: profileUpdateError } = await supabase
    .from("profiles")
    .update({ assigned_mentor_id: nextAssignedMentorId })
    .eq("id", userId);

  if (profileUpdateError) {
    return NextResponse.json({ message: "担当の更新に失敗しました。" }, { status: 500 });
  }

  await supabase.from("submissions").update({ assigned_mentor_id: nextAssignedMentorId }).eq("user_id", userId);

  return NextResponse.json({
    message: nextAssignedMentorId ? "担当メンターを更新しました。" : "担当メンターを解除しました。",
    assignedMentorId: nextAssignedMentorId,
  });
}
