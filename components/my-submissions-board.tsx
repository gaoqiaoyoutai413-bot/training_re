"use client";

import { useEffect, useMemo, useState } from "react";
import { SubmissionTable } from "@/components/submission-table";
import { StatCard } from "@/components/stat-card";
import { useAuth } from "@/components/auth-provider";
import type { Submission } from "@/types/domain";

export function MySubmissionsBoard() {
  const { profile, session } = useAuth();
  const [items, setItems] = useState<Submission[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
        const response = await fetch("/api/submissions?scope=mine", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          signal: controller.signal,
        });

        const result = (await response.json()) as { items?: Submission[]; message?: string };

        if (!response.ok) {
          setError(result.message ?? "提出一覧の取得に失敗しました。");
          setItems([]);
          setIsLoading(false);
          return;
        }

        const allItems = result.items ?? [];
        const filteredItems = profile?.id ? allItems.filter((item) => item.userId === profile.id) : allItems;
        setItems(filteredItems);
      } catch {
        if (!controller.signal.aborted) {
          setError("提出一覧の取得に失敗しました。時間を置いて再度お試しください。");
          setItems([]);
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
  }, [profile?.id, session?.access_token]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      reviewed: items.filter((item) => item.status === "passed" || item.status === "rework_requested").length,
      awaiting: items.filter((item) => item.status === "submitted" || item.status === "ai_reviewed").length,
    };
  }, [items]);

  if (isLoading) {
    return <div className="panel rounded-[30px] p-6 text-sm text-slate-600">提出一覧を読み込んでいます...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-3">
        <StatCard label="提出件数" value={`${stats.total}`} hint="これまでの提出総数" />
        <StatCard label="評価返却済み" value={`${stats.reviewed}`} hint="AIレビューまたはメンター評価が返ってきた件数" tone="accent" />
        <StatCard label="確認待ち" value={`${stats.awaiting}`} hint="今レビュー中の提出件数" tone="warning" />
      </div>

      {error ? <div className="panel rounded-[30px] p-4 text-sm text-[var(--warning)]">{error}</div> : null}

      <SubmissionTable linkBasePath="/submissions" showSubmittedAt submissions={items} />
    </div>
  );
}
