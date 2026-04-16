import { NextResponse } from "next/server";
import { getSlackIdByEmail } from "@/lib/member-directory";
import { getAuthorizedProfile } from "@/lib/server-auth";
import { getSubmissionList } from "@/lib/submission-repository";
import { sendMentorReviewedDirectMessage, sendMentorReviewedSlackNotification } from "@/lib/slack-notify";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const authorized = await getAuthorizedProfile(request, ["mentor", "admin"]);

  if (authorized.error || !authorized.profile) {
    return NextResponse.json({ message: authorized.error ?? "認証に失敗しました。" }, { status: authorized.status });
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? "";
  const scope = url.searchParams.get("scope") === "assigned" ? "assigned" : "all";

  const items = await getSubmissionList({
    viewerProfileId: authorized.profile.id,
    scope,
    search,
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const authorized = await getAuthorizedProfile(request, ["mentor", "admin"]);

  if (authorized.error || !authorized.profile) {
    return NextResponse.json({ message: authorized.error ?? "認証に失敗しました。" }, { status: authorized.status });
  }

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ message: "Supabase 接続情報が不足しています。" }, { status: 500 });
  }

  const body = (await request.json()) as {
    submissionId?: string;
    technicalScore?: number;
    businessScore?: number;
    result?: string;
    comment?: string;
  };

  const submissionId = String(body.submissionId ?? "").trim();
  const technicalScore = Number(body.technicalScore ?? 0);
  const businessScore = Number(body.businessScore ?? 0);
  const result = String(body.result ?? "").trim();
  const comment = String(body.comment ?? "").trim();

  if (!submissionId || !comment) {
    return NextResponse.json({ message: "必須項目が不足しています。" }, { status: 400 });
  }

  if (![1, 2, 3, 4, 5].includes(technicalScore) || ![1, 2, 3, 4, 5].includes(businessScore)) {
    return NextResponse.json({ message: "採点は1から5の範囲で入力してください。" }, { status: 400 });
  }

  if (result !== "passed" && result !== "rework_requested") {
    return NextResponse.json({ message: "判定が不正です。" }, { status: 400 });
  }

  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select(
      "id, user_id, review_task:tasks!submissions_task_id_fkey(task_code, title), learner_profile:profiles!submissions_user_id_fkey(name, email)",
    )
    .eq("id", submissionId)
    .maybeSingle();

  if (submissionError || !submission) {
    return NextResponse.json({ message: "対象の提出が見つかりません。" }, { status: 404 });
  }

  if (submission.user_id === authorized.profile.id) {
    return NextResponse.json({ message: "自分の提出に対してレビューはできません。" }, { status: 403 });
  }

  const { error: reviewUpsertError } = await supabase.from("mentor_reviews").upsert(
    {
      submission_id: submissionId,
      reviewer_id: authorized.profile.id,
      technical_score: technicalScore,
      business_score: businessScore,
      comment,
      result,
    },
    { onConflict: "submission_id" },
  );

  if (reviewUpsertError) {
    return NextResponse.json({ message: "レビュー結果の保存に失敗しました。" }, { status: 500 });
  }

  const { error: submissionUpdateError } = await supabase
    .from("submissions")
    .update({ status: result })
    .eq("id", submissionId);

  if (submissionUpdateError) {
    return NextResponse.json({ message: "提出ステータスの更新に失敗しました。" }, { status: 500 });
  }

  try {
    const task = Array.isArray(submission.review_task) ? submission.review_task[0] : submission.review_task;
    const profile = Array.isArray(submission.learner_profile) ? submission.learner_profile[0] : submission.learner_profile;

    await sendMentorReviewedSlackNotification({
      taskCode: task?.task_code ?? "UNKNOWN",
      taskTitle: task?.title ?? null,
      learnerName: profile?.name ?? "未設定",
      reviewerName: authorized.profile.name,
      result: result as "passed" | "rework_requested",
      technicalScore,
      businessScore,
    });

    if (profile?.email) {
      const slackId = await getSlackIdByEmail(profile.email);

      if (slackId) {
        await sendMentorReviewedDirectMessage({
          userSlackId: slackId,
          taskCode: task?.task_code ?? "UNKNOWN",
          taskTitle: task?.title ?? null,
          reviewerName: authorized.profile.name,
          result: result as "passed" | "rework_requested",
          technicalScore,
          businessScore,
        });
      }
    }
  } catch (error) {
    console.error("Slack notification failed after mentor review:", error);
  }

  return NextResponse.json({ message: "レビューを保存しました。" }, { status: 201 });
}
