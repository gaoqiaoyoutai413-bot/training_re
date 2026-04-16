"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { error, isLoading, profile } = useAuth();

  useEffect(() => {
    if (!isLoading && profile) {
      const nextPath = window.sessionStorage.getItem("tech-quest-next-path") ?? "/";
      window.sessionStorage.removeItem("tech-quest-next-path");
      router.replace(nextPath);
    }
  }, [isLoading, profile, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--sand)] px-6">
      <div className="panel rounded-[30px] p-8 text-center">
        <h1 className="text-2xl font-semibold text-[var(--navy)]">ログイン処理を完了しています</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {error ? error : isLoading ? "Google認証のセッションを確認しています..." : "ホームへ移動します。"}
        </p>
      </div>
    </div>
  );
}
