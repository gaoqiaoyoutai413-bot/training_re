import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { SectionHeading } from "@/components/section-heading";
import { formatMonthDay } from "@/lib/date-format";
import { getKnowledgeEntriesByTaskCode } from "@/lib/knowledge-repository";

export default async function KnowledgeTaskPage({
  params,
}: {
  params: Promise<{ taskCode: string }>;
}) {
  const { taskCode } = await params;
  const entries = await getKnowledgeEntriesByTaskCode(taskCode);

  if (entries.length === 0) {
    notFound();
  }

  const taskTitle = entries[0]?.taskTitle ?? taskCode;

  return (
    <AppShell currentPath="/knowledge">
      <section className="panel rounded-[34px] p-6 md:p-8">
        <SectionHeading
          eyebrow={`${taskCode} / ナレッジ`}
          title={`${taskTitle} の公開ナレッジ`}
          description="提出者名は出さず、README、メンターコメント、モック画像を課題別に整理しています。本文を読みながら、右側でコメントや画像をあわせて確認できます。"
        />
      </section>

      <div className="space-y-4">
        {entries.map((entry, index) => (
          <article key={entry.id} className="panel rounded-[30px] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="eyebrow text-xs text-slate-500">参考ナレッジ {index + 1}</div>
                <h3 className="mt-2 text-xl font-semibold text-[var(--navy)]">{entry.title}</h3>
                <div className="mt-2 text-sm text-slate-500">
                  {entry.publishedAt ? `${formatMonthDay(entry.publishedAt)} 公開` : "公開日未設定"}
                </div>
              </div>
              {entry.sourceCodeUrl ? (
                <a
                  className="inline-flex rounded-full border border-black/10 px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-white"
                  href={entry.sourceCodeUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  提出リンクを見る
                </a>
              ) : null}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)] xl:grid-cols-[minmax(0,1.6fr)_minmax(360px,0.8fr)]">
              <div className="space-y-4">
                <section className="rounded-[22px] bg-white/80 p-5">
                  <div className="text-xs text-slate-500">README 要約</div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">{entry.summary}</div>
                </section>

                <section className="rounded-[22px] bg-white/80 p-5">
                  <div className="text-xs text-slate-500">README 本文</div>
                  <div className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">{entry.readme}</div>
                </section>
              </div>

              <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
                <section className="rounded-[22px] bg-white/80 p-5">
                  <div className="text-xs text-slate-500">メンターコメント</div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">
                    {entry.mentorComment ?? "まだメンターコメントはありません。"}
                  </div>
                  {entry.mentorResult ? (
                    <div className="mt-3 inline-flex rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs text-[var(--accent-ink)]">
                      判定: {entry.mentorResult}
                    </div>
                  ) : null}
                </section>

                <section className="rounded-[22px] bg-white/80 p-5">
                  <div className="text-xs text-slate-500">見どころ</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {entry.highlights.length > 0 ? (
                      entry.highlights.map((highlight) => (
                        <span key={highlight} className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs text-[var(--accent-ink)]">
                          {highlight}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">まだ設定されていません。</span>
                    )}
                  </div>
                </section>

                <section className="rounded-[22px] bg-white/80 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">モック画像</div>
                    <span className="text-xs text-slate-400">{entry.images.length}件</span>
                  </div>
                  {entry.images.length > 0 ? (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                      {entry.images.map((image) => (
                        <a
                          key={image.id}
                          className="block overflow-hidden rounded-[18px] border border-black/5 bg-[var(--sand)]"
                          href={image.url}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img alt={image.label} className="h-44 w-full object-cover" src={image.url} />
                          <div className="px-3 py-2 text-xs text-slate-500">{image.label}</div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 text-sm text-slate-500">画像は登録されていません。</div>
                  )}
                </section>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="pb-4">
        <Link className="text-sm text-[var(--accent-ink)] underline-offset-4 hover:underline" href="/knowledge">
          ナレッジ一覧へ戻る
        </Link>
      </div>
    </AppShell>
  );
}
