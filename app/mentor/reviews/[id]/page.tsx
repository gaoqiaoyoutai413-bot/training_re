import { notFound } from "next/navigation";
import { AiReviewPanel } from "@/components/ai-review-panel";
import { AppShell } from "@/components/app-shell";
import { DetailTabs } from "@/components/detail-tabs";
import { DriveExportCard } from "@/components/drive-export-card";
import { KnowledgePublishForm } from "@/components/knowledge-publish-form";
import { MentorReviewForm } from "@/components/mentor-review-form";
import { ReviewScoreCard } from "@/components/review-score-card";
import { SectionHeading } from "@/components/section-heading";
import { formatMonthDay } from "@/lib/date-format";
import { getSubmissionDetail } from "@/lib/submission-repository";

export default async function MentorReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getSubmissionDetail(id);

  if (!detail) {
    notFound();
  }

  const { submission, taskTitle, files, aiReview, mentorReview } = detail;
  const mockupFiles = files.filter((file) => file.fileType === "mock_image");
  const codeFiles = files.filter((file) => file.fileType === "code_file");
  const detailTabs = [
    {
      id: "readme",
      label: "README",
      note: "採点前に README 本文を中心に確認できます。",
      content: (
        <div className="rounded-[20px] bg-white/80 p-6 text-[15px] leading-8 text-slate-600 whitespace-pre-wrap lg:min-h-[560px]">
          {submission.businessValueText}
        </div>
      ),
    },
    {
      id: "ai-review",
      label: "AIレビュー",
      note: "AI 一次レビューの要約、指摘、合格条件チェックを確認できます。",
      content: <AiReviewPanel review={aiReview} submissionId={submission.id} />,
    },
    {
      id: "mockups",
      label: "モック画像",
      note: "README と合わせてモック画像を確認し、実装イメージとの整合を見られます。",
      content: (
        <div className="panel rounded-[26px] bg-white/60 p-5">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-lg font-semibold text-[var(--navy)]">提出画像</h4>
            <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600">{mockupFiles.length}件</span>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {mockupFiles.length > 0 ? (
              mockupFiles.map((file) => (
                <div key={file.id} className="overflow-hidden rounded-[18px] bg-white p-4 text-sm text-slate-700">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-[var(--navy)]">モック画像</div>
                      <div className="mt-1 text-xs text-slate-600">{file.mimeType ?? "mime 未設定"}</div>
                    </div>
                    {file.previewUrl ? (
                      <a
                        className="rounded-full bg-[var(--navy)] px-3 py-1 text-xs font-medium text-white transition hover:opacity-90"
                        href={file.previewUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        別タブで開く
                      </a>
                    ) : null}
                  </div>
                  {file.previewUrl ? (
                    <img
                      alt="提出モック画像"
                      className="mt-4 h-auto max-h-[420px] w-full rounded-[14px] border border-black/5 object-contain"
                      src={file.previewUrl}
                    />
                  ) : (
                    <div className="mt-4 rounded-[14px] border border-dashed border-black/10 p-4 text-xs text-slate-500">
                      プレビュー URL を生成できませんでした。
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-[20px] bg-white p-4 text-sm text-slate-600 lg:col-span-2">モック画像はまだ登録されていません。</div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "code",
      label: "コード",
      note: "コード提出リンクと添付したコードファイルを確認できます。",
      content: (
        <div className="space-y-4">
          <div className="panel rounded-[26px] bg-white/60 p-5">
            <div className="text-sm font-medium text-slate-700">コード提出リンク</div>
            {submission.sourceCodeUrl ? (
              <a
                className="mt-3 block rounded-[20px] bg-white p-4 text-sm leading-6 text-[var(--accent-ink)] underline-offset-4 hover:underline"
                href={submission.sourceCodeUrl}
                rel="noreferrer"
                target="_blank"
              >
                {submission.sourceCodeUrl}
              </a>
            ) : (
              <div className="mt-3 rounded-[20px] bg-white p-4 text-sm text-slate-600">コード提出リンクは登録されていません。</div>
            )}
          </div>

          <div className="panel rounded-[26px] bg-white/60 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-medium text-slate-700">コードファイル</div>
              <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600">{codeFiles.length}件</span>
            </div>
            <div className="mt-4 grid gap-3">
              {codeFiles.length > 0 ? (
                codeFiles.map((file) => (
                  <div key={file.id} className="rounded-[18px] bg-white p-4 text-sm text-slate-700">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-[var(--navy)]">{file.storagePath.split("/").pop()}</div>
                        <div className="mt-1 text-xs text-slate-600">{file.mimeType ?? "mime 未設定"}</div>
                      </div>
                      {file.previewUrl ? (
                        <a
                          className="rounded-full bg-[var(--navy)] px-3 py-1 text-xs font-medium text-white transition hover:opacity-90"
                          href={file.previewUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          ダウンロード
                        </a>
                      ) : null}
                    </div>
                    <div className="mt-3 break-all text-xs leading-5 text-slate-500">{file.storagePath}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-[20px] bg-white p-4 text-sm text-slate-600">コードファイルはまだ登録されていません。</div>
              )}
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <AppShell currentPath="/mentor/reviews">
      <section className="panel rounded-[34px] p-6 md:p-8">
        <SectionHeading
          eyebrow="レビュー詳細"
          title={`${submission.userName} / ${submission.taskCode}`}
          description="README を主軸に、モック画像、AI所見、メンター評価、ナレッジ公開をまとめて確認できる画面です。採点判断に必要な情報だけを右側に集約しています。"
        />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[20px] bg-white/80 p-4">
            <div className="text-xs text-slate-500">課題</div>
            <div className="mt-1 text-lg font-semibold text-[var(--navy)]">{taskTitle ?? submission.taskCode}</div>
          </div>
          <div className="rounded-[20px] bg-white/80 p-4">
            <div className="text-xs text-slate-500">提出者</div>
            <div className="mt-1 text-lg font-semibold text-[var(--navy)]">{submission.userName}</div>
          </div>
          <div className="rounded-[20px] bg-white/80 p-4">
            <div className="text-xs text-slate-500">ステータス</div>
            <div className="mt-1 text-lg font-semibold text-[var(--navy)]">{submission.status}</div>
          </div>
          <div className="rounded-[20px] bg-white/80 p-4">
            <div className="text-xs text-slate-500">提出日時</div>
            <div className="mt-1 text-lg font-semibold text-[var(--navy)]">{formatMonthDay(submission.submittedAt)}</div>
          </div>
          <div className="rounded-[20px] bg-white/80 p-4 sm:col-span-2 lg:col-span-4">
            <div className="text-xs text-slate-500">担当メンター</div>
            <div className="mt-1 text-lg font-semibold text-[var(--navy)]">{submission.assignedMentorName ?? "まだ設定されていません"}</div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.9fr)_minmax(360px,0.86fr)] xl:grid-cols-[minmax(0,2.05fr)_minmax(400px,0.82fr)]">
        <section className="space-y-4">
          <DetailTabs
            description="README を起点に、AIレビューとモック画像を切り替えながら採点に必要な情報を確認できます。"
            tabs={detailTabs}
            title="提出内容"
          />
        </section>

        <section className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <DriveExportCard submission={submission} />
          <KnowledgePublishForm submission={submission} taskTitle={taskTitle} />
          {mentorReview ? <ReviewScoreCard review={mentorReview} submission={submission} /> : <MentorReviewForm submissionId={submission.id} submissionUserId={submission.userId} />}
        </section>
      </div>
    </AppShell>
  );
}
