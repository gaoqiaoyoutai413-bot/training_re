import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ message: "Supabase 接続情報が不足しています。" }, { status: 500 });
  }

  const body = (await request.json()) as {
    authUserId?: string;
    email?: string;
    name?: string;
  };

  const authUserId = String(body.authUserId ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const name = String(body.name ?? "").trim();

  if (!authUserId || !email || !name) {
    return NextResponse.json({ message: "プロフィール同期に必要な情報が不足しています。" }, { status: 400 });
  }

  const { data: existingByEmail, error: fetchError } = await supabase
    .from("profiles")
    .select("id, email, name, role, is_active, account_status")
    .eq("email", email)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ message: "既存プロフィールの確認に失敗しました。" }, { status: 500 });
  }

  if (existingByEmail) {
    if (existingByEmail.is_active === false || (existingByEmail.account_status && existingByEmail.account_status !== "active")) {
      return NextResponse.json({ message: "このアカウントは現在利用停止中です。管理者へお問い合わせください。" }, { status: 403 });
    }

    const { error: updateError } = await supabase.from("profiles").update({ name }).eq("id", existingByEmail.id);

    if (updateError) {
      return NextResponse.json({ message: "プロフィール更新に失敗しました。" }, { status: 500 });
    }

    return NextResponse.json({
      profile: {
        id: existingByEmail.id,
        email: existingByEmail.email,
        name,
        role: existingByEmail.role,
      },
    });
  }

  const profileId = authUserId || randomUUID();
  const { data: createdProfile, error: insertError } = await supabase
    .from("profiles")
    .insert({
      id: profileId,
      email,
      name,
      role: "student",
      account_status: "active",
    })
    .select("id, email, name, role")
    .single();

  if (insertError || !createdProfile) {
    return NextResponse.json({ message: "プロフィール作成に失敗しました。" }, { status: 500 });
  }

  return NextResponse.json({ profile: createdProfile });
}
