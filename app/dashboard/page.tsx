import { AppShell } from "@/components/app-shell";
import { SectionHeading } from "@/components/section-heading";
import { SkillRadarCard } from "@/components/skill-radar-card";
import { StatCard } from "@/components/stat-card";
import { studentDashboard, tasks } from "@/lib/mock-data";
import { topSkills } from "@/lib/metrics";

export default function DashboardPage() {
  const strongest = topSkills(studentDashboard.skillScores)[0];

  return (
    <AppShell currentPath="/dashboard">
      <section className="panel rounded-[34px] p-6 md:p-8">
        <SectionHeading
          eyebrow="受講生ダッシュボード"
          title="現在地と、次に伸ばすべき領域が見える。"
          description="完了課題からスキルスコアを動的に算出し、自由選択制の中でも次の挑戦先が分かる設計にしています。"
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCard label="完了課題" value={`${studentDashboard.completedTasks}`} hint={`${tasks.length} 課題中`} />
          <StatCard label="レビュー中" value={`${studentDashboard.inReview}`} hint="AI一次レビュー・メンター評価待ち" tone="warning" />
          <StatCard
            label="現在の最強軸"
            value={strongest.key}
            hint={`スコア ${strongest.value}。次は不足軸を補う課題選択が有効です。`}
            tone="accent"
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SkillRadarCard scores={studentDashboard.skillScores} />
        <section className="panel rounded-[30px] p-6">
          <div className="eyebrow text-xs text-slate-500">推奨ルート</div>
          <h3 className="mt-2 text-2xl font-semibold text-[var(--navy)]">{studentDashboard.recommendedTaskCode}</h3>
          <p className="mt-4 text-sm leading-6 text-slate-600">{studentDashboard.recommendedReason}</p>
          <div className="mt-6 rounded-[24px] bg-white/80 p-5">
            <div className="text-sm font-medium text-slate-700">提出時に必要なセット</div>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <li>ソースコードURL</li>
              <li>エビデンスファイル（PDF / 画像）</li>
              <li>ビジネス価値への考察</li>
            </ul>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
