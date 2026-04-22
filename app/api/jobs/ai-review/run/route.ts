import { NextResponse } from "next/server";
import { getDemoAiReview } from "@/lib/demo-data";
import { DEMO_MODE } from "@/lib/demo-mode";
import { runGeminiAiReview } from "@/lib/gemini-review";
import { getAuthorizedProfile } from "@/lib/server-auth";
import { getSubmissionDetail } from "@/lib/submission-repository";
import { sendAiReviewedSlackNotification } from "@/lib/slack-notify";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getTaskByTaskCode } from "@/lib/task-repository";

export async function POST(request: Request) {
  const authorized = await getAuthorizedProfile(request, ["student", "mentor", "admin"]);

  if (authorized.error || !authorized.profile) {
    return NextResponse.json({ message: authorized.error ?? "認証に失敗しました。" }, { status: authorized.status });
  }

  if (DEMO_MODE) {
    const body = (await request.json()) as { submissionId?: string };
    const submissionId = String(body.submissionId ?? "").trim();
    return NextResponse.json({
      message: "デモモードのため、固定の AIレビュー結果を返しています。",
      review: submissionId ? getDemoAiReview(submissionId) : null,
    });
  }

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ message: "Supabase 接続情報が不足しています。" }, { status: 500 });
  }

  const body = (await request.json()) as { submissionId?: string };
  const submissionId = String(body.submissionId ?? "").trim();

  if (!submissionId) {
    return NextResponse.json({ message: "submissionId が必要です。" }, { status: 400 });
  }

  const detail = await getSubmissionDetail(submissionId);

  if (!detail) {
    return NextResponse.json({ message: "対象の提出が見つかりません。" }, { status: 404 });
  }

  const { data: submissionOwner } = await supabase
    .from("submissions")
    .select("user_id, status")
    .eq("id", submissionId)
    .maybeSingle();

  if (!submissionOwner) {
    return NextResponse.json({ message: "提出情報の確認に失敗しました。" }, { status: 404 });
  }

  const canRun =
    authorized.profile.role === "admin" ||
    authorized.profile.role === "mentor" ||
    submissionOwner.user_id === authorized.profile.id;

  if (!canRun) {
    return NextResponse.json({ message: "この AIレビューを実行する権限がありません。" }, { status: 403 });
  }

  const task = await getTaskByTaskCode(detail.submission.taskCode);

  if (!task) {
    return NextResponse.json({ message: "課題情報の取得に失敗しました。" }, { status: 404 });
  }

  try {
    const aiReview = await runGeminiAiReview(task, detail);

    const { error: reviewUpsertError } = await supabase.from("ai_reviews").upsert(
      {
        submission_id: submissionId,
        model_name: aiReview.modelName,
        prompt_version: aiReview.promptVersion,
        security_score: aiReview.securityScore,
        readability_score: aiReview.readabilityScore,
        business_logic_score: aiReview.businessLogicScore,
        summary: aiReview.summary,
        raw_result_json: aiReview.rawResultJson,
      },
      { onConflict: "submission_id" },
    );

    if (reviewUpsertError) {
      return NextResponse.json({ message: "AIレビュー結果の保存に失敗しました。" }, { status: 500 });
    }

    if (submissionOwner.status === "submitted") {
      await supabase.from("submissions").update({ status: "ai_reviewed" }).eq("id", submissionId);
    }

    try {
      await sendAiReviewedSlackNotification({
        taskCode: detail.submission.taskCode,
        taskTitle: detail.taskTitle,
        learnerName: detail.submission.userName,
        submissionId,
        summary: aiReview.summary,
      });
    } catch (error) {
      console.error("Slack notification failed after AI review:", error);
    }

    return NextResponse.json({ message: "AIレビューを保存しました。", review: aiReview });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "AIレビューの実行に失敗しました。",
      },
      { status: 500 },
    );
  }
}
