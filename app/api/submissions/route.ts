import { NextResponse } from "next/server";
import { DEMO_MODE } from "@/lib/demo-mode";
import { getAuthorizedProfile } from "@/lib/server-auth";
import { getSubmissionList } from "@/lib/submission-repository";
import { sendSubmissionCreatedSlackNotification } from "@/lib/slack-notify";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function sanitizeFileName(fileName: string) {
  const normalized = fileName.normalize("NFKD");
  const replaced = normalized.replace(/[^\x20-\x7E]/g, "");
  const safe = replaced.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return safe || "evidence-file";
}

function isAllowedCodeFile(file: File) {
  const normalizedName = file.name.toLowerCase();
  return (
    /\.(zip|gs|js|ts|tsx|py|html|css|json|md|ipynb)$/i.test(normalizedName) ||
    (file.type || "").startsWith("text/") ||
    file.type === "application/json" ||
    file.type === "application/zip" ||
    file.type === "application/x-zip-compressed"
  );
}

export async function POST(request: Request) {
  const authorized = await getAuthorizedProfile(request, ["student", "mentor", "admin"]);

  if (authorized.error || !authorized.profile) {
    return NextResponse.json({ message: authorized.error ?? "認証に失敗しました。" }, { status: authorized.status });
  }

  if (DEMO_MODE) {
    return NextResponse.json(
      {
        status: "accepted",
        message: "デモモードのため、提出は保存せず成功メッセージのみ表示しています。",
        submissionId: "demo-submission-created",
      },
      { status: 201 },
    );
  }

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ message: "Supabase 接続情報が不足しています。" }, { status: 500 });
  }

  const formData = await request.formData();
  const taskCode = String(formData.get("taskCode") ?? "").trim();
  const sourceCodeUrl = String(formData.get("sourceCodeUrl") ?? "").trim();
  const businessValueText = String(formData.get("businessValueText") ?? "").trim();
  const mockupFiles = formData.getAll("mockupFiles").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  const codeFiles = formData.getAll("codeFiles").filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (!taskCode || !businessValueText.trim()) {
    return NextResponse.json({ message: "README は必須です。" }, { status: 400 });
  }

  if (mockupFiles.length === 0) {
    return NextResponse.json({ message: "モック画像は最低1枚提出してください。" }, { status: 400 });
  }

  if (mockupFiles.some((file) => !((file.type || "").startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(file.name)))) {
    return NextResponse.json({ message: "モック画像は png / jpg / jpeg / webp のみ提出できます。" }, { status: 400 });
  }

  if (codeFiles.some((file) => !isAllowedCodeFile(file))) {
    return NextResponse.json(
      { message: "コードファイルは zip / gs / js / ts / tsx / py / html / css / json / md / ipynb のみ提出できます。" },
      { status: 400 },
    );
  }

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("id, version, task_code, title")
    .eq("task_code", taskCode)
    .eq("is_active", true)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (taskError || !task) {
    return NextResponse.json({ message: "対象課題が見つかりません。" }, { status: 404 });
  }

  const userId = authorized.profile.id;
  let profileAssignedMentorId: string | null = null;
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("assigned_mentor_id")
    .eq("id", userId)
    .maybeSingle();
  profileAssignedMentorId = profileRow?.assigned_mentor_id ?? null;

  const assignedMentorId: string | null = profileAssignedMentorId;

  const { data: submission, error: submissionInsertError } = await supabase
    .from("submissions")
    .insert({
      task_id: task.id,
      task_version: task.version,
      user_id: userId,
      assigned_mentor_id: assignedMentorId,
      status: "submitted",
      source_code_url: sourceCodeUrl,
      business_value_text: businessValueText,
    })
    .select("id")
    .single();

  if (submissionInsertError || !submission) {
    return NextResponse.json({ message: "提出内容の保存に失敗しました。" }, { status: 500 });
  }

  for (const mockupFile of mockupFiles) {
    const extension = mockupFile.name.includes(".")
      ? mockupFile.name.split(".").pop()?.toLowerCase() ?? "bin"
      : "bin";
    const safeFileName = sanitizeFileName(mockupFile.name);
    const storagePath = `${submission.id}/mockup/${Date.now()}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("submission-evidence")
      .upload(storagePath, mockupFile, {
        contentType: mockupFile.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ message: `モック画像の保存に失敗しました: ${uploadError.message}` }, { status: 500 });
    }

    await supabase.from("submission_files").insert({
      submission_id: submission.id,
      storage_path: storagePath,
      file_type: "mock_image",
      mime_type: mockupFile.type || extension,
    });
  }

  for (const codeFile of codeFiles) {
    const extension = codeFile.name.includes(".")
      ? codeFile.name.split(".").pop()?.toLowerCase() ?? "bin"
      : "bin";
    const safeFileName = sanitizeFileName(codeFile.name);
    const storagePath = `${submission.id}/code/${Date.now()}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("submission-evidence")
      .upload(storagePath, codeFile, {
        contentType: codeFile.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ message: `コードファイルの保存に失敗しました: ${uploadError.message}` }, { status: 500 });
    }

    await supabase.from("submission_files").insert({
      submission_id: submission.id,
      storage_path: storagePath,
      file_type: "code_file",
      mime_type: codeFile.type || extension,
    });
  }

  try {
    await sendSubmissionCreatedSlackNotification({
      taskCode: task.task_code,
      taskTitle: task.title,
      learnerName: authorized.profile.name,
      learnerEmail: authorized.profile.email,
      submissionId: submission.id,
    });
  } catch (error) {
    console.error("Slack notification failed after submission:", error);
  }

  return NextResponse.json(
    {
      status: "accepted",
      message: "README、モック画像、コード提出情報を保存しました。",
      submissionId: submission.id,
    },
    { status: 201 },
  );
}

export async function GET(request: Request) {
  const authorized = await getAuthorizedProfile(request, ["student", "mentor", "admin"]);

  if (authorized.error || !authorized.profile) {
    return NextResponse.json({ message: authorized.error ?? "認証に失敗しました。" }, { status: authorized.status });
  }

  const url = new URL(request.url);
  const scope = url.searchParams.get("scope");
  const search = url.searchParams.get("search") ?? "";

  const items = await (async () => {
    if (scope === "assigned" && (authorized.profile.role === "mentor" || authorized.profile.role === "admin")) {
      return getSubmissionList({
        scope: "assigned",
        viewerProfileId: authorized.profile.id,
        search,
      });
    }

    if (scope === "mine" || authorized.profile.role === "student") {
      return getSubmissionList({
        scope: "mine",
        viewerProfileId: authorized.profile.id,
        search,
      });
    }

    return getSubmissionList({
      scope: "all",
      viewerProfileId: authorized.profile.id,
      search,
    });
  })();

  return NextResponse.json({ items });
}
