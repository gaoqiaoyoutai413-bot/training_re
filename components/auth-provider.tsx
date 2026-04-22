"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { createDemoSession, DEMO_MODE, DEMO_PROFILE } from "@/lib/demo-mode";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types/domain";

type AuthProfile = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

type AuthContextValue = {
  isLoading: boolean;
  session: Session | null;
  profile: AuthProfile | null;
  error: string;
  signInWithGoogle: (nextPath?: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const publicPaths = new Set(["/login", "/auth/callback"]);

function canAccess(role: UserRole | null, pathname: string) {
  if (DEMO_MODE) {
    return true;
  }

  if (publicPaths.has(pathname)) {
    return true;
  }

  if (!role) {
    return false;
  }

  if (pathname.startsWith("/admin")) {
    return role === "admin";
  }

  if (pathname.startsWith("/mentor")) {
    return role === "mentor" || role === "admin";
  }

  return true;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const pathnameRef = useRef(pathname);
  const lastSyncedUserIdRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(DEMO_MODE ? false : Boolean(supabase));
  const [session, setSession] = useState<Session | null>(DEMO_MODE ? createDemoSession() : null);
  const [profile, setProfile] = useState<AuthProfile | null>(DEMO_MODE ? DEMO_PROFILE : null);
  const [error, setError] = useState(DEMO_MODE ? "" : supabase ? "" : "Supabase 接続情報が不足しています。");

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (DEMO_MODE) {
      setSession(createDemoSession());
      setProfile(DEMO_PROFILE);
      setError("");
      setIsLoading(false);

      if (pathname === "/login" || pathname === "/auth/callback") {
        router.replace("/");
      }

      return;
    }

    if (!supabase) {
      return;
    }

    const syncProfile = async (nextSession: Session | null) => {
      const currentPath = pathnameRef.current;
      setSession(nextSession);

      if (!nextSession?.user) {
        lastSyncedUserIdRef.current = null;
        setProfile(null);
        setIsLoading(false);
        if (!publicPaths.has(currentPath)) {
          router.replace(`/login?next=${encodeURIComponent(currentPath)}`);
        }
        return;
      }

      if (lastSyncedUserIdRef.current === nextSession.user.id && profile) {
        setIsLoading(false);
        if (currentPath === "/login") {
          router.replace("/");
        } else if (!canAccess(profile.role, currentPath)) {
          router.replace("/");
        }
        return;
      }

      const email = nextSession.user.email ?? "";
      const allowedDomain = process.env.NEXT_PUBLIC_GOOGLE_WORKSPACE_DOMAIN?.trim().toLowerCase() ?? "";

      if (allowedDomain && !email.endsWith(`@${allowedDomain}`)) {
        await supabase.auth.signOut();
        setError(`許可されていないドメインです。${allowedDomain} のアカウントでログインしてください。`);
        setProfile(null);
        setIsLoading(false);
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch("/api/auth/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            authUserId: nextSession.user.id,
            email,
            name: nextSession.user.user_metadata?.full_name ?? nextSession.user.user_metadata?.name ?? email,
          }),
        });

        if (!response.ok) {
          const result = (await response.json()) as { message?: string };
          setError(result.message ?? "プロフィールの同期に失敗しました。");
          setProfile(null);
          setIsLoading(false);
          return;
        }

        const result = (await response.json()) as { profile: AuthProfile };
        lastSyncedUserIdRef.current = nextSession.user.id;
        setProfile(result.profile);
        setError("");
        setIsLoading(false);

        if (currentPath === "/login") {
          router.replace("/");
          return;
        }

        if (!canAccess(result.profile.role, currentPath)) {
          router.replace("/");
        }
      } catch {
        setError("プロフィールの同期に失敗しました。時間を置いて再度お試しください。");
        setProfile(null);
        setIsLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      void syncProfile(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void syncProfile(nextSession);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [profile, router, supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      session,
      profile,
      error,
      signInWithGoogle: async (nextPath = "/") => {
        if (DEMO_MODE) {
          router.replace(nextPath);
          return;
        }

        const supabase = createBrowserSupabaseClient();
        if (!supabase) {
          setError("Supabase 接続情報が不足しています。");
          return;
        }

        window.sessionStorage.setItem("tech-quest-next-path", nextPath);

        const redirectTo = `${window.location.origin}/auth/callback`;
        const { error: signInError } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo,
          },
        });

        if (signInError) {
          setError(signInError.message);
        }
      },
      signOut: async () => {
        if (DEMO_MODE) {
          router.replace("/");
          return;
        }

        const supabase = createBrowserSupabaseClient();
        if (!supabase) {
          return;
        }
        await supabase.auth.signOut();
        router.replace("/login");
      },
    }),
    [error, isLoading, profile, router, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoading, profile, error } = useAuth();

  if (publicPaths.has(pathname)) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--sand)] px-6">
        <div className="panel rounded-[30px] p-8 text-center text-sm text-slate-600">認証情報を確認しています...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--sand)] px-6">
        <div className="panel max-w-lg rounded-[30px] p-8 text-center">
          <h1 className="text-2xl font-semibold text-[var(--navy)]">ログインを完了できませんでした</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  if (!canAccess(profile.role, pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--sand)] px-6">
        <div className="panel max-w-lg rounded-[30px] p-8 text-center">
          <h1 className="text-2xl font-semibold text-[var(--navy)]">この画面へのアクセス権限がありません</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            現在のロールは {profile.role} です。必要な場合は管理者にロール付与を依頼してください。
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
