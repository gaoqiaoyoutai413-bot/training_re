"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { StatCard } from "@/components/stat-card";
import { useAuth } from "@/components/auth-provider";
import { formatMonthDay } from "@/lib/date-format";
import type { Submission } from "@/types/domain";
import Link from "next/link";

export function MentorReviewBoard() {
  const { profile, session } = useAuth();
  const [items, setItems] = useState<Submission[]>([]);
  const [search, setSearch] = useState("");
  const [mineOnly, setMineOnly] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session?.access_token) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams();
    if (mineOnly) {
      params.set("scope", "assigned");
    }
    if (search.trim()) {
      params.set("search", search.trim());
    }

    const load = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/reviews?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          signal: controller.signal,
        });

        const result = (await response.json()) as { items?: Submission[]; message?: string };

        if (!response.ok) {
          setError(result.message ?? "レビュー一覧の取得に失敗しました。");
          setItems([]);
          setIsLoading(false);
          return;
        }

        setItems(result.items ?? []);
      } catch {
        if (!controller.signal.aborted) {
          setError("レビュー一覧の取得に失敗しました。時間を置いて再度お試しください。");
          setItems([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    const timer = window.setTimeout(() => {
      void load();
    }, search ? 250 : 0);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [mineOnly, search, session?.access_token]);

  const stats = useMemo(() => {
    return {
      pending: items.filter((submission) => submission.status === "submitted").length,
      aiReviewed: items.filter((submission) => submission.status === "ai_reviewed").length,
      assigned: items.filter((submission) => Boolean(submission.assignedMentorId)).length,
    };
  }, [items]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="レビュー待ち" value={`${stats.pending}`} hint="提出済みで未処理の件数" />
        <StatCard label="AIレビュー完了" value={`${stats.aiReviewed}`} hint="先に確認しやすい候補" tone="accent" />
        <StatCard label="担当設定済み" value={`${stats.assigned}`} hint="担当メンターが紐づいている提出" tone="warning" />
      </div>

      <div className="panel rounded-[30px] p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              className="w-full rounded-2xl border border-black/10 bg-white px-11 py-3 text-sm outline-none"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="受講生名・課題コード・課題名で検索"
              value={search}
            />
          </label>

          <label className="inline-flex items-center justify-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-slate-700">
            <input
              checked={mineOnly}
              className="h-4 w-4 accent-[var(--navy)]"
              onChange={(event) => setMineOnly(event.target.checked)}
              type="checkbox"
            />
            自分の担当だけ見る
          </label>
        </div>
      </div>

      {error ? <div className="panel rounded-[30px] p-4 text-sm text-[var(--warning)]">{error}</div> : null}

      {isLoading ? (
        <div className="panel rounded-[30px] p-6 text-sm text-slate-600">レビュー一覧を読み込んでいます...</div>
      ) : (
        <div className="panel overflow-hidden rounded-[30px]">
          {items.length === 0 ? (
            <div className="p-6 text-sm text-slate-600">該当する提出はありません。</div>
          ) : (
            <table className="min-w-full border-collapse text-left">
              <thead className="bg-white/90 text-xs uppercase tracking-[0.12em] text-slate-600">
                <tr>
                  <th className="px-5 py-4">提出課題</th>
                  <th className="px-5 py-4">受講生</th>
                  <th className="px-5 py-4">担当</th>
                  <th className="px-5 py-4">提出日時</th>
                  <th className="px-5 py-4">ステータス</th>
                  <th className="px-5 py-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {items.map((submission) => {
                  return (
                    <tr key={submission.id} className="border-t border-black/5">
                      <td className="px-5 py-4 font-medium text-[var(--navy)]">{submission.taskTitle ?? submission.taskCode}</td>
                      <td className="px-5 py-4">{submission.userName}</td>
                      <td className="px-5 py-4">{submission.assignedMentorName ?? "未設定"}</td>
                      <td className="px-5 py-4 text-sm text-slate-700">{formatMonthDay(submission.submittedAt)}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          {submission.assignedMentorId === profile?.id ? (
                            <span className="inline-flex rounded-full bg-[var(--warning-soft)] px-3 py-1 text-xs font-medium text-[var(--warning)]">
                              自分が担当
                            </span>
                          ) : null}
                          <Link
                            className="inline-flex rounded-full bg-[var(--navy)] px-3 py-1 text-xs font-medium text-white transition hover:opacity-90"
                            href={`/mentor/reviews/${submission.id}`}
                          >
                            詳細を見る
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
