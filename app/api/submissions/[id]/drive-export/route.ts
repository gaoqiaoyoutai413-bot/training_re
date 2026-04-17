import { NextResponse } from "next/server";
import { exportSubmissionToDrive } from "@/lib/google-drive-archive";
import { getAuthorizedProfile } from "@/lib/server-auth";
import { sendDriveExportFailedSlackNotification } from "@/lib/slack-notify";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authorized = await getAuthorizedProfile(request, ["admin"]);

  if (authorized.error || !authorized.profile) {
    return NextResponse.json({ message: authorized.error ?? "認証に失敗しました。" }, { status: authorized.status });
  }

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ message: "Supabase 接続情報が不足しています。" }, { status: 500 });
  }

  const { id } = await params;
  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select(
      "id, submitted_at, business_value_text, source_code_url, status, drive_export_status, review_task:tasks!submissions_task_id_fkey(task_code, title), learner_profile:profiles!submissions_user_id_fkey(name, email)",
    )
    .eq("id", id)
    .maybeSingle();

  if (submissionError || !submission) {
    return NextResponse.json({ message: "対象の提出が見つかりません。" }, { status: 404 });
  }

  if (submission.status !== "passed") {
    return NextResponse.json({ message: "Drive 退避は合格提出のみ再実行できます。" }, { status: 400 });
  }

  const task = Array.isArray(submission.review_task) ? submission.review_task[0] : submission.review_task;
  const profile = Array.isArray(submission.learner_profile) ? submission.learner_profile[0] : submission.learner_profile;

  if (!profile?.name) {
    return NextResponse.json({ message: "提出者名が取得できません。" }, { status: 400 });
  }

  await supabase
    .from("submissions")
    .update({
      drive_export_status: "pending",
      drive_export_error: null,
    })
    .eq("id", id);

  try {
    const exportResult = await exportSubmissionToDrive({
      submissionId: id,
      taskCode: task?.task_code ?? "UNKNOWN",
      taskTitle: task?.title ?? null,
      userName: profile.name,
      submittedAt: submission.submitted_at,
      readmeContent: submission.business_value_text,
      sourceCodeUrl: submission.source_code_url || null,
    });

    await supabase
      .from("submissions")
      .update({
        drive_folder_id: exportResult.folderId,
        drive_export_status: "exported",
        drive_exported_at: new Date().toISOString(),
        drive_export_error: null,
      })
      .eq("id", id);

    return NextResponse.json({
      message: "Drive 退避を再実行しました。",
      folderId: exportResult.folderId,
      folderUrl: exportResult.folderUrl,
    });
  } catch (driveError) {
    const errorMessage = driveError instanceof Error ? driveError.message : "Drive 退避に失敗しました。";

    await supabase
      .from("submissions")
      .update({
        drive_export_status: "failed",
        drive_export_error: errorMessage,
      })
      .eq("id", id);

    await sendDriveExportFailedSlackNotification({
      submissionId: id,
      taskCode: task?.task_code ?? "UNKNOWN",
      taskTitle: task?.title ?? null,
      learnerName: profile.name,
      errorMessage,
    });

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
