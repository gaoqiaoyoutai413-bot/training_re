import { NextResponse } from "next/server";
import { getLearnerSnapshots } from "@/lib/learner-repository";
import { getAuthorizedProfile } from "@/lib/server-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/domain";

export async function GET(request: Request) {
  const authorized = await getAuthorizedProfile(request, ["admin"]);

  if (authorized.error) {
    return NextResponse.json({ message: authorized.error }, { status: authorized.status });
  }

  const items = await getLearnerSnapshots();
  return NextResponse.json({ items });
}

export async function PATCH(request: Request) {
  const authorized = await getAuthorizedProfile(request, ["admin"]);

  if (authorized.error) {
    return NextResponse.json({ message: authorized.error }, { status: authorized.status });
  }

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ message: "Supabase 接続情報が不足しています。" }, { status: 500 });
  }

  const body = (await request.json()) as { userId?: string; role?: UserRole };
  const userId = String(body.userId ?? "").trim();
  const role = body.role;

  if (!userId || !role || !["student", "mentor", "admin"].includes(role)) {
    return NextResponse.json({ message: "更新内容が不正です。" }, { status: 400 });
  }

  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);

  if (error) {
    return NextResponse.json({ message: "ロール更新に失敗しました。" }, { status: 500 });
  }

  return NextResponse.json({ message: "ロールを更新しました。" });
}
