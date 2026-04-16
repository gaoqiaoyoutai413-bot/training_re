import { AppShell } from "@/components/app-shell";
import { QuestCard } from "@/components/quest-card";
import { SectionHeading } from "@/components/section-heading";
import { StatCard } from "@/components/stat-card";
import { getPlatformOverviewMetrics } from "@/lib/dashboard-repository";
import { getTasks } from "@/lib/task-repository";

export default async function HomePage() {
  const [tasks, overview] = await Promise.all([getTasks(), getPlatformOverviewMetrics()]);

  return (
    <AppShell currentPath="/">
      <section className="panel rounded-[34px] px-6 py-8 md:px-8">
        <SectionHeading
          eyebrow="ホーム"
          title="研修運営ダッシュボード"
          description="課題、レビュー状況、次の推奨課題を確認できます。"
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCard label="公開課題" value={`${overview.taskCount}`} hint="課題マスタから管理できます。" />
          <StatCard
            label="レビュー待ち"
            value={`${overview.inReviewCount}`}
            hint="提出済みで確認待ちの件数です。"
            tone="warning"
          />
          <StatCard
            label="公開ナレッジ"
            value={`${overview.knowledgeCount}`}
            hint="匿名公開されている参考ナレッジ件数です。"
            tone="accent"
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-4">
          <SectionHeading
            eyebrow="課題一覧"
            title="公開中の課題"
            description="現在公開されている課題の一部を表示しています。"
          />
          <div className="grid gap-4 xl:grid-cols-2">
            {tasks.length > 0 ? (
              tasks.slice(0, 4).map((task) => <QuestCard key={task.id} task={task} />)
            ) : (
              <div className="panel rounded-[30px] p-6 text-sm text-slate-600 xl:col-span-2">
                公開中の課題はまだ登録されていません。
              </div>
            )}
          </div>
        </section>

        <div className="space-y-6">
          <section className="panel rounded-[30px] p-6">
            <div className="eyebrow text-xs text-slate-500">運営メモ</div>
            <h3 className="mt-2 text-2xl font-semibold text-[var(--navy)]">確認ポイント</h3>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
              <li>課題定義は Supabase の課題マスタで管理します。</li>
              <li>レビューは AI 一次確認とメンター評価の二段階です。</li>
              <li>提出物は README とモック画像を中心に扱います。</li>
              <li>利用停止や退職者は利用状態で管理し、履歴は残します。</li>
            </ul>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
