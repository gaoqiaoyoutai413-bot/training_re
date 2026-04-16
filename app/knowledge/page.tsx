import { AppShell } from "@/components/app-shell";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { formatMonthDay } from "@/lib/date-format";
import { getKnowledgeTaskGroups } from "@/lib/knowledge-repository";

export default async function KnowledgePage() {
  const knowledgeGroups = await getKnowledgeTaskGroups();

  return (
    <AppShell currentPath="/knowledge">
      <section className="panel rounded-[34px] p-6 md:p-8">
        <SectionHeading
          eyebrow="ナレッジ共有"
          title="課題ごとに、良い README とレビュー観点を匿名で学ぶ。"
          description="提出者名は出さず、README、メンターコメント、モック画像など、次の人が参考にしやすい学習素材だけを課題単位で整理して公開します。"
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {knowledgeGroups.length > 0 ? (
          knowledgeGroups.map((group) => (
            <article key={group.taskCode} className="panel rounded-[28px] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="eyebrow text-xs text-slate-500">{group.taskCode}</div>
                  <h3 className="mt-2 text-2xl font-semibold text-[var(--navy)]">{group.taskTitle ?? group.taskCode}</h3>
                  <div className="mt-2 text-sm text-slate-500">
                    公開ナレッジ {group.entryCount}件
                    {group.latestPublishedAt ? ` / ${formatMonthDay(group.latestPublishedAt)} 更新` : ""}
                  </div>
                </div>
                <Link
                  className="inline-flex rounded-full bg-[var(--navy)] px-4 py-2 text-xs font-medium text-white transition hover:opacity-90"
                  href={`/knowledge/${group.taskCode}`}
                >
                  この課題のナレッジを見る
                </Link>
              </div>

              <div className="mt-4 rounded-[20px] bg-white/80 p-4 text-sm leading-6 text-slate-600">{group.latestSummary}</div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[var(--sand)] px-3 py-1 text-xs text-slate-700">README</span>
                <span className="rounded-full bg-[var(--sand)] px-3 py-1 text-xs text-slate-700">メンターコメント</span>
                <span className="rounded-full bg-[var(--sand)] px-3 py-1 text-xs text-slate-700">モック画像</span>
                {group.highlights.map((highlight) => (
                  <span key={highlight} className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs text-[var(--accent-ink)]">
                    {highlight}
                  </span>
                ))}
              </div>
            </article>
          ))
        ) : (
          <div className="panel rounded-[28px] p-6 text-sm text-slate-600 xl:col-span-2">
            まだ公開済みナレッジはありません。
          </div>
        )}
      </div>
    </AppShell>
  );
}
