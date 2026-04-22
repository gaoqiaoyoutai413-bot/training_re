import { NextResponse } from "next/server";
import { DEMO_MODE } from "@/lib/demo-mode";
import { getAuthorizedProfile } from "@/lib/server-auth";
import { getKnowledgeEntries } from "@/lib/knowledge-repository";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const authorized = await getAuthorizedProfile(request, ["student", "mentor", "admin"]);

  if (authorized.error) {
    return NextResponse.json({ message: authorized.error }, { status: authorized.status });
  }

  const items = await getKnowledgeEntries();
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const authorized = await getAuthorizedProfile(request, ["mentor", "admin"]);

  if (authorized.error || !authorized.profile) {
    return NextResponse.json({ message: authorized.error ?? "認証に失敗しました。" }, { status: authorized.status });
  }

  if (DEMO_MODE) {
    return NextResponse.json({ message: "デモモードのため、ナレッジ公開は保存せず成功表示のみ返しています。" }, { status: 201 });
  }

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ message: "Supabase 接続情報が不足しています。" }, { status: 500 });
  }

  const body = (await request.json()) as {
    submissionId?: string;
    title?: string;
    summary?: string;
    highlights?: string[];
  };

  const submissionId = String(body.submissionId ?? "").trim();
  const title = String(body.title ?? "").trim();
  const summary = String(body.summary ?? "").trim();
  const highlights = Array.isArray(body.highlights)
    ? body.highlights.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)
    : [];

  if (!submissionId || !title || !summary) {
    return NextResponse.json({ message: "公開に必要な項目が不足しています。" }, { status: 400 });
  }

  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select("id, status")
    .eq("id", submissionId)
    .maybeSingle();

  if (submissionError || !submission) {
    return NextResponse.json({ message: "対象の提出が見つかりません。" }, { status: 404 });
  }

  if (submission.status !== "passed") {
    return NextResponse.json({ message: "合格済みの提出のみナレッジ公開できます。" }, { status: 400 });
  }

  const { error: upsertError } = await supabase.from("knowledge_entries").upsert(
    {
      submission_id: submissionId,
      published_by: authorized.profile.id,
      title,
      summary,
      highlights_json: highlights,
      is_public_within_org: true,
    },
    { onConflict: "submission_id" },
  );

  if (upsertError) {
    return NextResponse.json({ message: "ナレッジ公開に失敗しました。" }, { status: 500 });
  }

  return NextResponse.json({ message: "ナレッジを公開しました。" }, { status: 201 });
}
