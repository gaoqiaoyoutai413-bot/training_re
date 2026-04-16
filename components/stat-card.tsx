import { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "accent" | "warning";
  icon?: ReactNode;
}) {
  const toneMap = {
    default: "bg-white/70 text-slate-900",
    accent: "bg-[var(--accent-soft)] text-[var(--accent-ink)]",
    warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  };

  return (
    <article className={`panel rounded-[28px] p-5 ${toneMap[tone]}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-slate-500">{label}</span>
        {icon}
      </div>
      <div className="mt-3 text-3xl font-semibold">{value}</div>
      <p className="mt-2 text-sm leading-6">{hint}</p>
    </article>
  );
}
