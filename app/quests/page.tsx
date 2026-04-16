import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { QuestCard } from "@/components/quest-card";
import { SectionHeading } from "@/components/section-heading";
import { getTasks } from "@/lib/task-repository";
import { formatTaskCategory } from "@/lib/utils";

export default async function QuestsPage() {
  const tasks = await getTasks();
  const categories = ["all", ...new Set(tasks.map((task) => task.category))];
  const difficulties = ["all", "★1", "★2", "★3", "★4"];

  return (
    <AppShell currentPath="/quests">
      <section className="panel rounded-[34px] p-6 md:p-8">
        <SectionHeading
          eyebrow="課題一覧"
          title="業務起点で選べる課題ボード"
          description="カテゴリ・難易度で絞り込みつつ、依存関係は『必須』ではなく『推奨ルート』として示す設計です。"
        />
        <div className="mt-6 flex flex-wrap gap-3">
          {categories.map((category) => (
            <span key={category} className="rounded-full bg-white px-4 py-2 text-sm text-slate-700">
              {category === "all" ? "all" : formatTaskCategory(category)}
            </span>
          ))}
          {difficulties.map((difficulty) => (
            <span key={difficulty} className="rounded-full bg-[var(--accent-soft)] px-4 py-2 text-sm text-[var(--accent-ink)]">
              {difficulty}
            </span>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <Link key={task.id} href={`/quests/${task.taskCode}`}>
              <QuestCard task={task} />
            </Link>
          ))
        ) : (
          <div className="panel rounded-[30px] p-6 text-sm text-slate-600 xl:col-span-2">
            公開中の課題はまだ登録されていません。
          </div>
        )}
      </section>
    </AppShell>
  );
}
