import type { Session } from "@supabase/supabase-js";
import type { UserRole } from "@/types/domain";

export const DEMO_MODE =
  process.env.NEXT_PUBLIC_DEMO_MODE === undefined
    ? true
    : process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

export const DEMO_ACCESS_TOKEN = "demo-access-token";

export const DEMO_PROFILE: {
  id: string;
  email: string;
  name: string;
  role: UserRole;
} = {
  id: "demo-admin",
  email: "admin.demo@example.test",
  name: "Demo Admin",
  role: "admin",
};

export function createDemoSession(): Session {
  const now = Math.floor(Date.now() / 1000);

  return {
    access_token: DEMO_ACCESS_TOKEN,
    refresh_token: "demo-refresh-token",
    expires_in: 60 * 60 * 24,
    expires_at: now + 60 * 60 * 24,
    token_type: "bearer",
    user: {
      id: DEMO_PROFILE.id,
      app_metadata: {
        provider: "demo",
        providers: ["demo"],
      },
      user_metadata: {
        full_name: DEMO_PROFILE.name,
        name: DEMO_PROFILE.name,
      },
      aud: "authenticated",
      created_at: new Date(0).toISOString(),
      email: DEMO_PROFILE.email,
    },
  } as Session;
}
