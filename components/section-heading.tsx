export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-2">
      <div className="eyebrow text-xs tracking-[0.16em] text-slate-500">{eyebrow}</div>
      <h2 className="max-w-4xl text-2xl font-semibold leading-tight text-[var(--navy)] md:text-[2rem]">{title}</h2>
      <p className="max-w-4xl text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
