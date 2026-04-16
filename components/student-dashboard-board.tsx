"use client";

import { useEffect, useMemo, useState } from "react";
import { SkillRadarCard } from "@/components/skill-radar-card";
import { StatCard } from "@/components/stat-card";
import { useAuth } from "@/components/auth-provider";
import { topSkills } from "@/lib/metrics";
import type { DashboardMetrics } from "@/types/domain";

type DashboardResponse = DashboardMetrics & { message?: string };

export function StudentDashboardBoard({ taskCount }: { taskCount: number }) {
  const { session } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    completedTasks: 0,
    inReview: 0,
    recommendedTaskCode: "-",
    recommendedReason: "提出実績が蓄積されると、ここに次の推奨課題が表示されます。",
    skillScores: {
      automation: 0,
      ai: 0,
      integration: 0,
    },
  });
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
        const response = await fetch("/api/dashboard/me", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          signal: controller.signal,
        });

        const result = (await response.json()) as DashboardResponse;

        if (!response.ok) {
          setError(result.message ?? "ダッシュボードの取得に失敗しました。");
          return;
        }

        setMetrics({
          completedTasks: result.completedTasks,
          inReview: result.inReview,
          recommendedTaskCode: result.recommendedTaskCode,
          recommendedReason: result.recommendedReason,
          skillScores: result.skillScores,
        });
      } catch {
        if (!controller.signal.aborted) {
          setError("ダッシュボードの取得に失敗しました。時間を置いて再度お試しください。");
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

  const strongest = useMemo(() => topSkills(metrics.skillScores)[0] ?? { key: "-", value: 0 }, [metrics.skillScores]);

  if (isLoading) {
    return <div className="panel rounded-[30px] p-6 text-sm text-slate-600">ダッシュボードを読み込んでいます...</div>;
  }

  return (
    <div className="space-y-6">
      {error ? <div className="panel rounded-[30px] p-4 text-sm text-[var(--warning)]">{error}</div> : null}

      <section className="panel rounded-[34px] p-6 md:p-8">
        <div className="mt-0 grid gap-4 md:grid-cols-3">
          <StatCard label="完了課題" value={`${metrics.completedTasks}`} hint={`${taskCount} 課題中`} />
          <StatCard label="レビュー中" value={`${metrics.inReview}`} hint="AI一次レビュー・メンター評価待ち" tone="warning" />
          <StatCard
            label="現在の最強軸"
            value={String(strongest.key)}
            hint={`スコア ${strongest.value}。次は不足軸を補う課題選択が有効です。`}
            tone="accent"
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SkillRadarCard scores={metrics.skillScores} />
        <section className="panel rounded-[30px] p-6">
          <div className="eyebrow text-xs text-slate-500">推奨ルート</div>
          <h3 className="mt-2 text-2xl font-semibold text-[var(--navy)]">{metrics.recommendedTaskCode}</h3>
          <p className="mt-4 text-sm leading-6 text-slate-600">{metrics.recommendedReason}</p>
          <div className="mt-6 rounded-[24px] bg-white/80 p-5">
            <div className="text-sm font-medium text-slate-700">提出時に必要なセット</div>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <li>README / 提出本文</li>
              <li>モック画像</li>
              <li>補足リンク（任意）</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
