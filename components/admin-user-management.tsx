"use client";

import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@/components/auth-provider";
import { LearnerTable } from "@/components/learner-table";
import type { LearnerSnapshot, UserRole } from "@/types/domain";

export function AdminUserManagement() {
  const { session } = useAuth();
  const [learners, setLearners] = useState<LearnerSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(session?.access_token));
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const accessToken = session?.access_token;

    if (!accessToken) {
      return;
    }

    const load = async () => {
      const response = await fetch("/api/learners", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const result = (await response.json()) as { items?: LearnerSnapshot[]; message?: string };

      if (!response.ok) {
        setError(result.message ?? "ユーザー一覧の取得に失敗しました。");
        setIsLoading(false);
        return;
      }

      setLearners(result.items ?? []);
      setError("");
      setIsLoading(false);
    };

    void load();
  }, [session?.access_token]);

  const averageCompleted =
    learners.length > 0 ? (learners.reduce((sum, learner) => sum + learner.completedTasks, 0) / learners.length).toFixed(1) : "0.0";

  const mentorCount = learners.filter((learner) => learner.role === "mentor").length;
  const adminCount = learners.filter((learner) => learner.role === "admin").length;

  return (
    <>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-[24px] bg-white/80 p-4">
          <div className="text-xs text-slate-500">登録ユーザー</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--navy)]">{learners.length}名</div>
        </div>
        <div className="rounded-[24px] bg-white/80 p-4">
          <div className="text-xs text-slate-500">メンター</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--navy)]">{mentorCount}名</div>
        </div>
        <div className="rounded-[24px] bg-white/80 p-4">
          <div className="text-xs text-slate-500">管理者</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--navy)]">{adminCount}名</div>
        </div>
        <div className="rounded-[24px] bg-white/80 p-4">
          <div className="text-xs text-slate-500">平均完了課題</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--navy)]">{averageCompleted}件</div>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-[22px] bg-[var(--warning-soft)] p-4 text-sm text-[var(--warning)]">{error}</div>
      ) : null}

      {message ? (
        <div className="mt-6 rounded-[22px] bg-[var(--accent-soft)] p-4 text-sm text-[var(--accent-ink)]">{message}</div>
      ) : null}

      <div className="mt-6">
        {isLoading ? (
          <div className="panel rounded-[30px] p-6 text-sm text-slate-600">ユーザー一覧を読み込んでいます...</div>
        ) : (
          <LearnerTable
            learners={learners}
            onRoleChange={(userId, role) => {
              if (!session?.access_token) {
                return;
              }

              setMessage("");
              setError("");
              setUpdatingUserId(userId);

              startTransition(async () => {
                const response = await fetch("/api/learners", {
                  method: "PATCH",
                  headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ userId, role }),
                });

                const result = (await response.json()) as { message?: string };

                if (!response.ok) {
                  setError(result.message ?? "ロール更新に失敗しました。");
                  setUpdatingUserId(null);
                  return;
                }

                setLearners((current) =>
                  current.map((learner) => (learner.id === userId ? { ...learner, role: role as UserRole } : learner)),
                );
                setMessage(result.message ?? "ロールを更新しました。");
                setUpdatingUserId(null);
              });
            }}
            updatingUserId={isPending ? updatingUserId : null}
          />
        )}
      </div>
    </>
  );
}
