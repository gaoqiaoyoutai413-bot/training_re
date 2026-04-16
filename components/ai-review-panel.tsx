"use client";

import { useState, useTransition } from "react";
import { useAuth } from "@/components/auth-provider";
import { formatMonthDay } from "@/lib/date-format";
import type { AiReviewRecord } from "@/types/domain";

function severityLabel(value: string) {
  if (value === "high") return "高";
  if (value === "medium") return "中";
  return "低";
}

function categoryLabel(value: string) {
  if (value === "security") return "セキュリティ";
  if (value === "readability") return "可読性";
  return "ビジネス価値";
}

function acceptanceStatusLabel(value: string) {
  if (value === "met") return "満たしている";
  if (value === "partial") return "一部満たす";
  if (value === "missing") return "不足";
  return "要確認";
}

function acceptanceStatusTone(value: string) {
  if (value === "met") return "bg-emerald-50 text-emerald-700";
  if (value === "partial") return "bg-amber-50 text-amber-700";
  if (value === "missing") return "bg-rose-50 text-rose-700";
  return "bg-slate-100 text-slate-600";
}

export function AiReviewPanel({
  submissionId,
  review,
}: {
  submissionId: string;
  review: AiReviewRecord | null;
}) {
  const { profile, session } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const acceptanceChecks = review?.acceptanceChecks ?? [];
  const findings = review?.findings ?? [];
  const mentorFlags = review?.mentorFlags ?? [];

  return (
    <section className="panel rounded-[30px] p-5">
      <div className="eyebrow text-xs text-slate-500">AI一次レビュー</div>
      <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-[var(--navy)]">Gemini による事前チェック</h3>
          <p className="mt-1 text-sm leading-5 text-slate-600">
            課題 rubric と提出内容をもとに、セキュリティ・可読性・ビジネス価値の3観点で一次レビューします。
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">AIレビューは参考情報です。合格・差し戻しの最終判定はメンターが行います。</p>
        </div>
        <button
          className="rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending || !profile || !session?.access_token}
          onClick={() => {
            setError("");
            setMessage("");
            startTransition(async () => {
              const response = await fetch("/api/jobs/ai-review/run", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${session?.access_token ?? ""}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ submissionId }),
              });

              const result = (await response.json()) as { message?: string };

              if (!response.ok) {
                setError(result.message ?? "AIレビューの実行に失敗しました。");
                return;
              }

              setMessage(result.message ?? "AIレビューを保存しました。");
              window.location.reload();
            });
          }}
          type="button"
        >
          {isPending ? "AIレビューを実行中..." : review ? "AIレビューを再実行" : "AIレビューを実行"}
        </button>
      </div>

      {error ? <div className="mt-4 rounded-[20px] bg-[var(--warning-soft)] p-4 text-sm text-[var(--warning)]">{error}</div> : null}
      {message ? (
        <div className="mt-4 rounded-[20px] bg-[var(--accent-soft)] p-4 text-sm text-[var(--accent-ink)]">{message}</div>
      ) : null}

      {review ? (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[20px] bg-white/80 p-4">
              <div className="text-xs text-slate-500">セキュリティ</div>
              <div className="mt-2 text-3xl font-semibold text-[var(--navy)]">{review.securityScore}</div>
            </div>
            <div className="rounded-[20px] bg-white/80 p-4">
              <div className="text-xs text-slate-500">可読性</div>
              <div className="mt-2 text-3xl font-semibold text-[var(--navy)]">{review.readabilityScore}</div>
            </div>
            <div className="rounded-[20px] bg-white/80 p-4">
              <div className="text-xs text-slate-500">ビジネス価値</div>
              <div className="mt-2 text-3xl font-semibold text-[var(--navy)]">{review.businessLogicScore}</div>
            </div>
            <div className="rounded-[20px] bg-white/80 p-4">
              <div className="text-xs text-slate-500">指摘件数</div>
              <div className="mt-2 text-3xl font-semibold text-[var(--navy)]">{findings.length}</div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-[20px] bg-white/80 p-4 text-sm leading-6 text-slate-600">
              <div className="font-medium text-[var(--navy)]">要約</div>
              <div className="mt-2">{review.summary}</div>
              <div className="mt-3 rounded-[16px] bg-[var(--sand)] px-4 py-3 text-xs leading-5 text-slate-600">
                この内容はレビュー補助です。評価確定や合否判定はメンターが判断します。
              </div>
              <div className="mt-3 text-xs text-slate-500">
                モデル: {review.modelName} / Prompt: {review.promptVersion} / 実行日時: {formatMonthDay(review.reviewedAt)}
              </div>
              {acceptanceChecks.length > 0 ? (
                <details className="mt-4 rounded-[18px] bg-[var(--sand)] p-4">
                  <summary className="cursor-pointer font-medium text-[var(--navy)]">合格条件チェック</summary>
                  <div className="mt-3 space-y-2">
                    {acceptanceChecks.map((check) => (
                      <div key={`${check.label}-${check.status}`} className="rounded-[16px] bg-white/80 p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-[var(--navy)]">{check.label}</span>
                          <span className={`rounded-full px-3 py-1 text-xs ${acceptanceStatusTone(check.status)}`}>
                            {acceptanceStatusLabel(check.status)}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-slate-600">{check.comment}</div>
                      </div>
                    ))}
                  </div>
                </details>
              ) : null}
              {mentorFlags.length > 0 ? (
                <details className="mt-4 rounded-[18px] bg-[var(--accent-soft)] p-4 text-[var(--accent-ink)]">
                  <summary className="cursor-pointer font-medium">メンター確認ポイント</summary>
                  <ul className="mt-2 space-y-1 text-sm leading-5">
                    {mentorFlags.map((flag) => (
                      <li key={flag}>{flag}</li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </div>

            <div className="grid gap-3 xl:grid-cols-2">
              {findings.length > 0 ? (
                findings.map((finding, index) => (
                  <details key={`${finding.title}-${index}`} className="rounded-[20px] bg-white/80 p-4 text-sm leading-6 text-slate-600">
                    <summary className="cursor-pointer list-none">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs text-[var(--accent-ink)]">
                          {categoryLabel(finding.category)}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                          重要度 {severityLabel(finding.severity)}
                        </span>
                        <span className="font-medium text-[var(--navy)]">{finding.title}</span>
                      </div>
                    </summary>
                    <div className="mt-3">{finding.detail}</div>
                    <div className="mt-3 rounded-[16px] bg-[var(--sand)] px-4 py-3 text-sm text-slate-700">
                      改善提案: {finding.suggestion}
                    </div>
                  </details>
                ))
              ) : (
                <div className="rounded-[20px] bg-white/80 p-4 text-sm text-slate-600">重大な指摘はありませんでした。</div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="mt-4 rounded-[20px] bg-white/80 p-4 text-sm text-slate-600">
          まだ AIレビューは実行されていません。提出内容を保存したあと、この画面から一次レビューを開始できます。AIレビューは参考情報であり、最終判定はメンターが行います。
        </div>
      )}
    </section>
  );
}
