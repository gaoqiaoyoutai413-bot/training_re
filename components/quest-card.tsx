import { ArrowRight, Sparkles } from "lucide-react";
import type { Task } from "@/types/domain";
import { formatDifficulty, formatTaskCategory } from "@/lib/utils";

export function QuestCard({ task }: { task: Task }) {
  return (
    <article className="panel rounded-[30px] p-5 transition hover:-translate-y-1">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="eyebrow text-xs text-slate-500">
            {task.taskCode} / v{task.version}
          </div>
          <h3 className="mt-2 text-xl font-semibold text-[var(--navy)]">{task.title}</h3>
        </div>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs text-white">{formatTaskCategory(task.category)}</span>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">{task.summary}</p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
        <span className="rounded-full bg-white px-3 py-1">{formatDifficulty(task.difficulty)}</span>
        <span className="rounded-full bg-white px-3 py-1">{task.estimatedHours}h</span>
        <span className="rounded-full bg-white px-3 py-1">{task.learningObjective}</span>
      </div>

      <div className="mt-5 rounded-2xl bg-white/80 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--accent-ink)]">
          <Sparkles className="h-4 w-4" />
          推奨レビュー観点
        </div>
        <div className="flex flex-wrap gap-2">
          {task.rubricHighlights.map((item) => (
            <span key={item} className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs text-[var(--accent-ink)]">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
        <div>
          {task.recommendedDependencies.length > 0
            ? `推奨前提: ${task.recommendedDependencies.map((dependency) => dependency.taskCode).join(", ")}`
            : "この課題は単独で開始可能"}
        </div>
        <ArrowRight className="h-4 w-4" />
      </div>
    </article>
  );
}
