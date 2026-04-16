"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useAuth } from "@/components/auth-provider";
import type { LearnerSnapshot } from "@/types/domain";

type MentorOption = {
  id: string;
  name: string;
  email: string;
};

export function AssignmentManager() {
  const { profile, session } = useAuth();
  const [learners, setLearners] = useState<LearnerSnapshot[]>([]);
  const [mentors, setMentors] = useState<MentorOption[]>([]);
  const [search, setSearch] = useState("");
  const [mineOnly, setMineOnly] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!session?.access_token) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    const load = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/assignments", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          signal: controller.signal,
        });

        const result = (await response.json()) as {
          learners?: LearnerSnapshot[];
          mentors?: MentorOption[];
          message?: string;
        };

        if (!response.ok) {
          setError(result.message ?? "担当一覧の取得に失敗しました。");
          setLearners([]);
          setMentors([]);
          return;
        }

        setLearners(result.learners ?? []);
        setMentors(result.mentors ?? []);
      } catch {
        if (!controller.signal.aborted) {
          setError("担当一覧の取得に失敗しました。時間を置いて再度お試しください。");
          setLearners([]);
          setMentors([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      controller.abort();
    };
  }, [session?.access_token]);

  const filteredLearners = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return learners.filter((learner) => {
      if (mineOnly && profile?.role === "mentor" && learner.assignedMentorId !== profile.id) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystacks = [
        learner.name,
        learner.email,
        learner.assignedMentorName ?? "",
      ];

      return haystacks.some((value) => value.toLowerCase().includes(normalizedSearch));
    });
  }, [learners, mineOnly, profile?.id, profile?.role, search]);

  const updateAssignment = (userId: string, payload: { action: string; assignedMentorId?: string | null }) => {
    if (!session?.access_token) {
      setError("ログイン情報を確認できません。");
      return;
    }

    setUpdatingUserId(userId);
    setError("");
    setMessage("");

    startTransition(async () => {
      const response = await fetch("/api/assignments", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, ...payload }),
      });

      const result = (await response.json()) as { message?: string; assignedMentorId?: string | null };

      if (!response.ok) {
        setError(result.message ?? "担当更新に失敗しました。");
        setUpdatingUserId(null);
        return;
      }

      const nextAssignedMentorId = result.assignedMentorId ?? null;
      const nextAssignedMentorName =
        nextAssignedMentorId === null
          ? null
          : nextAssignedMentorId === profile?.id
            ? profile.name
            : mentors.find((mentor) => mentor.id === nextAssignedMentorId)?.name ?? null;

      setLearners((current) =>
        current.map((learner) =>
          learner.id === userId
            ? {
                ...learner,
                assignedMentorId: nextAssignedMentorId,
                assignedMentorName: nextAssignedMentorName,
              }
            : learner,
        ),
      );
      setMessage(result.message ?? "担当を更新しました。");
      setUpdatingUserId(null);
    });
  };

  if (isLoading) {
    return <div className="panel rounded-[30px] p-6 text-sm text-slate-600">担当設定一覧を読み込んでいます...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="panel rounded-[30px] p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-2xl border border-black/10 bg-white px-11 py-3 text-sm outline-none"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="受講生名・メール・担当名で検索"
              value={search}
            />
          </label>

          {profile?.role === "mentor" ? (
            <label className="inline-flex items-center justify-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-slate-700">
              <input
                checked={mineOnly}
                className="h-4 w-4 accent-[var(--navy)]"
                onChange={(event) => setMineOnly(event.target.checked)}
                type="checkbox"
              />
              自分の担当だけ見る
            </label>
          ) : null}
        </div>
      </div>

      {error ? <div className="panel rounded-[30px] p-4 text-sm text-[var(--warning)]">{error}</div> : null}
      {message ? <div className="panel rounded-[30px] p-4 text-sm text-[var(--accent-ink)]">{message}</div> : null}

      <div className="panel overflow-hidden rounded-[30px]">
        {filteredLearners.length === 0 ? (
          <div className="p-6 text-sm text-slate-600">該当するユーザーはありません。</div>
        ) : (
          <table className="min-w-full border-collapse text-left">
            <thead className="bg-white/80 text-xs uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="px-5 py-4">ユーザー</th>
                <th className="px-5 py-4">ロール</th>
                <th className="px-5 py-4">提出数</th>
                <th className="px-5 py-4">現在の担当</th>
                <th className="px-5 py-4">担当編集</th>
              </tr>
            </thead>
            <tbody>
              {filteredLearners.map((learner) => {
                const isMine = learner.assignedMentorId === profile?.id;

                return (
                  <tr key={learner.id} className="border-t border-black/5">
                    <td className="px-5 py-4">
                      <div className="font-medium text-[var(--navy)]">{learner.name}</div>
                      <div className="mt-1 text-xs text-slate-500">{learner.email}</div>
                    </td>
                    <td className="px-5 py-4">{learner.role}</td>
                    <td className="px-5 py-4">{learner.submissionCount ?? 0}</td>
                    <td className="px-5 py-4">{learner.assignedMentorName ?? "未設定"}</td>
                    <td className="px-5 py-4">
                      {profile?.role === "admin" ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs text-slate-700 outline-none disabled:opacity-60"
                            disabled={updatingUserId === learner.id}
                            onChange={(event) => {
                              const value = event.target.value;
                              updateAssignment(learner.id, {
                                action: value ? "set_assigned_mentor" : "clear_assignment",
                                assignedMentorId: value || null,
                              });
                            }}
                            value={learner.assignedMentorId ?? ""}
                          >
                            <option value="">未設定</option>
                            {mentors.map((mentor) => (
                              <option key={mentor.id} value={mentor.id}>
                                {mentor.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {!isMine ? (
                            <button
                              className="rounded-full bg-[var(--navy)] px-4 py-2 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                              disabled={updatingUserId === learner.id}
                              onClick={() => updateAssignment(learner.id, { action: "assign_self" })}
                              type="button"
                            >
                              {updatingUserId === learner.id ? "更新中..." : "自分を担当にする"}
                            </button>
                          ) : (
                            <button
                              className="rounded-full border border-black/10 px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-white disabled:opacity-60"
                              disabled={updatingUserId === learner.id}
                              onClick={() => updateAssignment(learner.id, { action: "clear_assignment" })}
                              type="button"
                            >
                              {updatingUserId === learner.id ? "更新中..." : "担当を外す"}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
