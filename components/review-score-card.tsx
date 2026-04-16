import { formatMonthDay } from "@/lib/date-format";
import { MentorReviewDraft, MentorReviewRecord, Submission } from "@/types/domain";

export function ReviewScoreCard({
  submission,
  draft,
  review,
}: {
  submission: Submission;
  draft?: MentorReviewDraft | null;
  review?: MentorReviewRecord | null;
}) {
  const technicalScore = review?.technicalScore ?? draft?.technicalScore ?? 0;
  const businessScore = review?.businessScore ?? draft?.businessScore ?? 0;
  const comment = review?.comment ?? draft?.comment ?? "まだコメントはありません。";
  const result = review?.result ?? draft?.result ?? "rework_requested";
  const strengths = draft?.strengths ?? [];
  const concerns = draft?.concerns ?? [];

  return (
    <section className="panel rounded-[30px] p-5">
      <div className="eyebrow text-xs text-slate-500">{review ? "保存済みレビュー" : "レビュー案"}</div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-[var(--navy)]">メンター採点内容</h3>
        <div className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-xs text-white">{result}</div>
      </div>
      <div className="mt-4 grid gap-3 grid-cols-2">
        <div className="rounded-[20px] bg-white/80 p-4">
          <div className="text-xs text-slate-500">技術点</div>
          <div className="mt-1 text-3xl font-semibold text-[var(--navy)]">{technicalScore}</div>
        </div>
        <div className="rounded-[20px] bg-white/80 p-4">
          <div className="text-xs text-slate-500">ビジネス点</div>
          <div className="mt-1 text-3xl font-semibold text-[var(--navy)]">{businessScore}</div>
        </div>
      </div>
      <div className="mt-4 rounded-[20px] bg-[var(--accent-soft)] p-4 text-sm leading-5 text-[var(--accent-ink)]">
        AIレビュー要約: {submission.aiSummary}
      </div>
      {strengths.length > 0 || concerns.length > 0 ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-[20px] bg-white/80 p-4">
            <div className="text-sm font-medium text-slate-700">良い点</div>
            <ul className="mt-2 space-y-1 text-sm leading-5 text-slate-600">
              {strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-[20px] bg-white/80 p-4">
            <div className="text-sm font-medium text-slate-700">懸念点</div>
            <ul className="mt-2 space-y-1 text-sm leading-5 text-slate-600">
              {concerns.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
      {review ? (
        <div className="mt-4 rounded-[20px] bg-white/80 p-4 text-xs text-slate-500">
          レビュー担当: {review.reviewerName} / レビュー日時: {formatMonthDay(review.reviewedAt)}
        </div>
      ) : null}
      <details className="mt-4 rounded-[20px] bg-white/80 p-4 text-sm leading-6 text-slate-600" open>
        <summary className="cursor-pointer font-medium text-[var(--navy)]">コメントを見る</summary>
        <div className="mt-3">{comment}</div>
      </details>
    </section>
  );
}
