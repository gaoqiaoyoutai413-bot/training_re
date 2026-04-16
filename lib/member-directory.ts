import { createExternalServerSupabaseClient } from "@/lib/supabase/external-server";

export async function getSlackIdByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return null;
  }

  const supabase = createExternalServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.from("members").select("slack_id").eq("email", normalizedEmail).maybeSingle();

  if (error) {
    throw new Error(`外部 members 参照に失敗しました: ${error.message}`);
  }

  return data?.slack_id?.trim() || null;
}
