import { DEMO_MODE, DEMO_PROFILE } from "@/lib/demo-mode";
import type { UserRole } from "@/types/domain";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getAuthorizedProfile(request: Request, allowedRoles: UserRole[]) {
  if (DEMO_MODE) {
    const supabase = createServerSupabaseClient();

    if (supabase) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, role")
        .order("created_at", { ascending: true });

      const orderedRoles: UserRole[] = ["admin", "mentor", "student"];
      const matchedProfile = orderedRoles
        .filter((role) => allowedRoles.includes(role) || role === "admin")
        .flatMap((role) => (profiles ?? []).filter((profile) => profile.role === role))
        [0];

      if (matchedProfile?.id) {
        return {
          error: null,
          status: 200 as const,
          profile: {
            ...DEMO_PROFILE,
            id: matchedProfile.id,
          },
        };
      }
    }

    return {
      error: null,
      status: 200 as const,
      profile: DEMO_PROFILE,
    };
  }

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return { error: "Supabase 接続情報が不足しています。", status: 500 as const, profile: null };
  }

  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";

  if (!accessToken) {
    return { error: "認証トークンがありません。", status: 401 as const, profile: null };
  }

  const { data: authUser, error: authError } = await supabase.auth.getUser(accessToken);

  if (authError || !authUser.user?.email) {
    return { error: "ログイン情報を確認できませんでした。", status: 401 as const, profile: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, name, role, is_active, account_status")
    .eq("email", authUser.user.email.toLowerCase())
    .maybeSingle();

  if (profileError || !profile) {
    return { error: "プロフィール情報が見つかりません。", status: 403 as const, profile: null };
  }

  if (profile.is_active === false || (profile.account_status && profile.account_status !== "active")) {
    return { error: "このアカウントは現在利用停止中です。管理者へお問い合わせください。", status: 403 as const, profile: null };
  }

  if (!allowedRoles.includes(profile.role as UserRole)) {
    return { error: "この操作を実行する権限がありません。", status: 403 as const, profile: null };
  }

  return {
    error: null,
    status: 200 as const,
    profile: {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role as UserRole,
    },
  };
}
