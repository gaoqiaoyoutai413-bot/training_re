import { NextResponse } from "next/server";
import { DEMO_MODE } from "@/lib/demo-mode";
import { getLearnerSnapshots } from "@/lib/learner-repository";
import { getAuthorizedProfile } from "@/lib/server-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AccountStatus, UserRole } from "@/types/domain";

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

  if (DEMO_MODE) {
    return NextResponse.json({ message: "デモモードのため、表示上のみ更新成功として扱います。" });
  }

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ message: "Supabase 接続情報が不足しています。" }, { status: 500 });
  }

  const body = (await request.json()) as { userId?: string; role?: UserRole; accountStatus?: AccountStatus };
  const userId = String(body.userId ?? "").trim();
  const role = body.role;
  const accountStatus = body.accountStatus;

  if (!userId) {
    return NextResponse.json({ message: "更新内容が不正です。" }, { status: 400 });
  }

  const updates: { role?: UserRole; account_status?: AccountStatus; is_active?: boolean } = {};

  if (role) {
    if (!["student", "mentor", "admin"].includes(role)) {
      return NextResponse.json({ message: "ロール更新内容が不正です。" }, { status: 400 });
    }
    updates.role = role;
  }

  if (accountStatus) {
    if (!["active", "inactive", "retired"].includes(accountStatus)) {
      return NextResponse.json({ message: "利用状態が不正です。" }, { status: 400 });
    }
    updates.account_status = accountStatus;
    updates.is_active = accountStatus === "active";
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ message: "更新対象がありません。" }, { status: 400 });
  }

  const { error } = await supabase.from("profiles").update(updates).eq("id", userId);

  if (error) {
    return NextResponse.json({ message: "ユーザー更新に失敗しました。" }, { status: 500 });
  }

  return NextResponse.json({ message: "ユーザー情報を更新しました。" });
}
