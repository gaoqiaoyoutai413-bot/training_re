"use client";

import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@/components/auth-provider";
import { LearnerTable } from "@/components/learner-table";
import type { AccountStatus, LearnerSnapshot, UserRole } from "@/types/domain";

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
  const inactiveCount = learners.filter((learner) => learner.accountStatus === "inactive" || learner.accountStatus === "retired").length;

  const updateLearner = (userId: string, payload: { role?: UserRole; accountStatus?: AccountStatus }) => {
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
        body: JSON.stringify({ userId, ...payload }),
      });

      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(result.message ?? "ユーザー更新に失敗しました。");
        setUpdatingUserId(null);
        return;
      }

      setLearners((current) =>
        current.map((learner) =>
          learner.id === userId
            ? {
                ...learner,
                ...(payload.role ? { role: payload.role } : {}),
                ...(payload.accountStatus ? { accountStatus: payload.accountStatus } : {}),
              }
            : learner,
        ),
      );
      setMessage(result.message ?? "ユーザー情報を更新しました。");
      setUpdatingUserId(null);
    });
  };

  return (
    <>
      <div className="mt-8 grid gap-4 md:grid-cols-5">
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
          <div className="text-xs text-slate-500">停止 / 退職</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--navy)]">{inactiveCount}名</div>
        </div>
        <div className="rounded-[24px] bg-white/80 p-4">
          <div className="text-xs text-slate-500">平均完了課題</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--navy)]">{averageCompleted}件</div>
        </div>
      </div>

      <div className="mt-6 rounded-[24px] bg-[var(--sand)] p-5 text-sm leading-6 text-slate-600">
        <div className="font-medium text-[var(--navy)]">退職・停止・削除の運用</div>
        <div className="mt-2">
          退職者や一時停止ユーザーは物理削除せず、まず `inactive` または `retired` に変更します。提出履歴と評価履歴は保持され、ログインのみ停止されます。
          個別削除が必要な場合は、運用ポリシーに基づき admin 判断で別対応してください。
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
              updateLearner(userId, { role });
            }}
            onAccountStatusChange={(userId, accountStatus) => {
              updateLearner(userId, { accountStatus });
            }}
            updatingUserId={isPending ? updatingUserId : null}
          />
        )}
      </div>
    </>
  );
}
