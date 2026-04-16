import { createClient } from "@supabase/supabase-js";

export function createExternalServerSupabaseClient() {
  const url = process.env.EXTERNAL_SUPABASE_URL;
  const serviceRoleKey = process.env.EXTERNAL_SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
