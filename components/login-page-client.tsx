"use client";

import { useAuth } from "@/components/auth-provider";

export function LoginPageClient({ nextPath }: { nextPath: string | null }) {
  const { error, isLoading, profile, signInWithGoogle } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--sand)] px-6">
      <div className="panel w-full max-w-xl rounded-[34px] p-8 md:p-10">
        <div className="eyebrow text-xs text-slate-500">Tech-Quest</div>
        <h1 className="mt-2 text-3xl font-semibold text-[var(--navy)]">Google Workspaceでログイン</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          社内アカウントでログインすると、受講生・メンター・管理者のロールに応じた画面へアクセスできます。
        </p>
        {nextPath ? (
          <div className="mt-5 rounded-[24px] bg-white/80 p-4 text-sm text-slate-600">
            ログイン後は <span className="font-medium text-[var(--navy)]">{nextPath}</span> へ戻ります。
          </div>
        ) : null}
        {profile ? (
          <div className="mt-5 rounded-[24px] bg-[var(--accent-soft)] p-4 text-sm text-[var(--accent-ink)]">
            {profile.name} としてログイン済みです。ホームへ移動しています。
          </div>
        ) : null}
        {error ? (
          <div className="mt-5 rounded-[24px] bg-[var(--warning-soft)] p-4 text-sm text-[var(--warning)]">{error}</div>
        ) : null}
        <button
          className="mt-6 rounded-full bg-[var(--navy)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoading}
          onClick={() => {
            void signInWithGoogle(nextPath ?? "/");
          }}
          type="button"
        >
          {isLoading ? "確認中..." : "Googleでログイン"}
        </button>
      </div>
    </div>
  );
}
