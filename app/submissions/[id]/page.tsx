import { notFound } from "next/navigation";
import { AiReviewPanel } from "@/components/ai-review-panel";
import { AppShell } from "@/components/app-shell";
import { DetailTabs } from "@/components/detail-tabs";
import { ReviewScoreCard } from "@/components/review-score-card";
import { SectionHeading } from "@/components/section-heading";
import { formatMonthDay } from "@/lib/date-format";
import { getMentorDraftBySubmissionId, getSubmissionDetail } from "@/lib/submission-repository";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getSubmissionDetail(id);

  if (!detail) {
    notFound();
  }

  const draft = getMentorDraftBySubmissionId(id);
  const { submission, taskTitle, files, aiReview, mentorReview } = detail;
  const detailTabs = [
    {
      id: "readme",
      label: "README",
      note: "提出の中心となる README を広く表示しています。",
      content: (
        <div className="rounded-[20px] bg-white/80 p-6 text-[15px] leading-8 text-slate-600 whitespace-pre-wrap lg:min-h-[560px]">
          {submission.businessValueText}
        </div>
      ),
    },
    {
      id: "ai-review",
      label: "AIレビュー",
      note: "Gemini による一次レビュー結果を確認できます。",
      content: <AiReviewPanel review={aiReview} submissionId={submission.id} />,
    },
    {
      id: "mockups",
      label: "モック画像",
      note: "提出されたモック画像や画面イメージを確認できます。",
      content: (
        <div className="panel rounded-[26px] bg-white/60 p-5">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-lg font-semibold text-[var(--navy)]">モック画像</h4>
            <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-500">{files.length}件</span>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {files.length > 0 ? (
              files.map((file) => (
                <details key={file.id} className="rounded-[18px] bg-white p-4 text-sm text-slate-600">
                  <summary className="cursor-pointer list-none">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-[var(--navy)]">{file.fileType}</div>
                        <div className="mt-1 text-xs text-slate-500">{file.mimeType ?? "mime 未設定"}</div>
                      </div>
                      <span className="text-xs text-slate-400">詳細</span>
                    </div>
                  </summary>
                  <div className="mt-3 break-all text-xs leading-5">{file.storagePath}</div>
                </details>
              ))
            ) : (
              <div className="rounded-[20px] bg-white p-4 text-sm text-slate-600 lg:col-span-2">モック画像はまだ登録されていません。</div>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <AppShell currentPath="/submissions">
      <section className="panel rounded-[34px] p-6 md:p-8">
        <SectionHeading
          eyebrow={`${submission.taskCode} / 提出詳細`}
          title={`${submission.userName} の提出内容`}
          description="README を中心に、モック画像、AIレビュー、メンター評価を一つの画面で確認できます。本文を読みやすく、補助情報は右側にまとめています。"
        />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[20px] bg-white/80 p-4">
            <div className="text-xs text-slate-500">ステータス</div>
            <div className="mt-1 text-lg font-semibold">{submission.status}</div>
          </div>
          <div className="rounded-[20px] bg-white/80 p-4">
            <div className="text-xs text-slate-500">提出日時</div>
            <div className="mt-1 text-lg font-semibold">{formatMonthDay(submission.submittedAt)}</div>
          </div>
          <div className="rounded-[20px] bg-white/80 p-4">
            <div className="text-xs text-slate-500">課題</div>
            <div className="mt-1 text-lg font-semibold">{taskTitle ?? submission.taskCode}</div>
          </div>
          <div className="rounded-[20px] bg-white/80 p-4 sm:col-span-2 lg:col-span-4">
            <div className="text-xs text-slate-500">担当メンター</div>
            <div className="mt-1 text-lg font-semibold">{submission.assignedMentorName ?? "まだ設定されていません"}</div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.9fr)_minmax(360px,0.86fr)] xl:grid-cols-[minmax(0,2.05fr)_minmax(380px,0.82fr)]">
        <section className="space-y-4">
          <DetailTabs
            description="README を中心に、AIレビューとモック画像を切り替えながら確認できます。"
            tabs={detailTabs}
            title="提出内容"
          />
        </section>

        <section className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="panel rounded-[30px] p-5">
            <div className="eyebrow text-xs text-slate-500">補足情報</div>
            <h3 className="mt-2 text-lg font-semibold text-[var(--navy)]">補足リンク</h3>
            {submission.sourceCodeUrl ? (
              <a
                className="mt-3 block rounded-[20px] bg-white/80 p-4 text-sm leading-6 text-[var(--accent-ink)] underline-offset-4 hover:underline"
                href={submission.sourceCodeUrl}
                rel="noreferrer"
                target="_blank"
              >
                {submission.sourceCodeUrl}
              </a>
            ) : (
              <div className="mt-3 rounded-[20px] bg-white/80 p-4 text-sm text-slate-600">補足リンクは提出されていません。</div>
            )}
          </div>

          {mentorReview ? <ReviewScoreCard review={mentorReview} submission={submission} /> : null}
          {!mentorReview && draft ? <ReviewScoreCard draft={draft} submission={submission} /> : null}
        </section>
      </div>
    </AppShell>
  );
}
