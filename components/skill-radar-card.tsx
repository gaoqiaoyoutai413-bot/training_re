import type { SkillScores } from "@/types/domain";

const axes = [
  { key: "automation", label: "自動化力" },
  { key: "ai", label: "AI活用力" },
  { key: "integration", label: "外部連携力" },
] as const;

export function SkillRadarCard({ scores }: { scores: SkillScores }) {
  return (
    <article className="panel rounded-[30px] p-6">
      <div className="eyebrow text-xs text-slate-500">Skill Radar</div>
      <h3 className="mt-2 text-2xl font-semibold text-[var(--navy)]">現在の強みバランス</h3>
      <div className="mt-6 space-y-4">
        {axes.map((axis) => (
          <div key={axis.key}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span>{axis.label}</span>
              <span className="text-slate-500">{scores[axis.key]} / 100</span>
            </div>
            <div className="h-3 rounded-full bg-white">
              <div
                className="h-3 rounded-full bg-[var(--accent)]"
                style={{ width: `${scores[axis.key]}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
