import Link from "next/link";
import { formatMonthDay } from "@/lib/date-format";
import type { Submission } from "@/types/domain";

export function SubmissionTable({
  submissions,
  linkBasePath,
  showAssignedMentor = false,
  showSubmittedAt = false,
}: {
  submissions: Submission[];
  linkBasePath?: string;
  showAssignedMentor?: boolean;
  showSubmittedAt?: boolean;
}) {
  if (submissions.length === 0) {
    return (
      <div className="panel rounded-[30px] p-6 text-sm text-slate-600">
        まだ提出データはありません。
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden rounded-[30px]">
      <table className="min-w-full border-collapse text-left">
        <thead className="bg-white/80 text-xs uppercase tracking-[0.12em] text-slate-500">
          <tr>
            <th className="px-5 py-4">提出課題</th>
            <th className="px-5 py-4">受講生</th>
            {showAssignedMentor ? <th className="px-5 py-4">担当メンター</th> : null}
            {showSubmittedAt ? <th className="px-5 py-4">提出日時</th> : null}
            <th className="px-5 py-4">ステータス</th>
            <th className="px-5 py-4">AI要約</th>
            {linkBasePath ? <th className="px-5 py-4">詳細</th> : null}
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission) => (
            <tr key={submission.id} className="border-t border-black/5">
              <td className="px-5 py-4 font-medium text-[var(--navy)]">
                {linkBasePath ? (
                  <Link
                    className="underline-offset-4 hover:text-[var(--accent-ink)] hover:underline"
                    href={`${linkBasePath}/${submission.id}`}
                  >
                    {submission.taskCode}
                  </Link>
                ) : (
                  submission.taskCode
                )}
              </td>
              <td className="px-5 py-4">{submission.userName}</td>
              {showAssignedMentor ? <td className="px-5 py-4">{submission.assignedMentorName ?? "未設定"}</td> : null}
              {showSubmittedAt ? <td className="px-5 py-4 text-sm text-slate-600">{formatMonthDay(submission.submittedAt)}</td> : null}
              <td className="px-5 py-4">
                <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs text-[var(--accent-ink)]">
                  {submission.status}
                </span>
              </td>
              <td className="px-5 py-4 text-sm leading-6 text-slate-600">{submission.aiSummary}</td>
              {linkBasePath ? (
                <td className="px-5 py-4">
                  <Link
                    className="inline-flex rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-[var(--accent-ink)] transition hover:bg-white"
                    href={`${linkBasePath}/${submission.id}`}
                  >
                    提出詳細を見る
                  </Link>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
