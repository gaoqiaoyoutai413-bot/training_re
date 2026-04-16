"use client";

import { useState, useTransition } from "react";
import { useAuth } from "@/components/auth-provider";
import type { Submission } from "@/types/domain";

function buildDefaultHighlights(submission: Submission) {
  return [
    submission.taskCode,
    "READMEあり",
    submission.sourceCodeUrl ? "提出リンクあり" : "",
  ].filter(Boolean);
}

export function KnowledgePublishForm({
  submission,
  taskTitle,
}: {
  submission: Submission;
  taskTitle: string | null;
}) {
  const { profile, session } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(taskTitle ?? submission.taskCode);
  const [summary, setSummary] = useState(submission.businessValueText.slice(0, 220));
  const [highlightsText, setHighlightsText] = useState(buildDefaultHighlights(submission).join("\n"));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!profile || (profile.role !== "mentor" && profile.role !== "admin")) {
    return null;
  }

  if (submission.status !== "passed") {
    return null;
  }

  return (
    <section className="panel rounded-[30px] p-5">
      <div className="eyebrow text-xs text-slate-500">ナレッジ公開</div>
      <h3 className="mt-2 text-lg font-semibold text-[var(--navy)]">この提出をライブラリへ載せる</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        提出者名は出さず、README・メンターコメント・モック画像など、学習に必要な素材だけを匿名で公開します。
      </p>

      <div className="mt-4 space-y-3">
        <label className="block">
          <div className="mb-2 text-xs text-slate-500">公開タイトル</div>
          <input
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
            onChange={(event) => setTitle(event.target.value)}
            value={title}
          />
        </label>

        <label className="block">
          <div className="mb-2 text-xs text-slate-500">要約</div>
          <textarea
            className="min-h-[120px] w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm leading-6 outline-none"
            onChange={(event) => setSummary(event.target.value)}
            value={summary}
          />
        </label>

        <label className="block">
          <div className="mb-2 text-xs text-slate-500">ハイライト</div>
          <textarea
            className="min-h-[96px] w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm leading-6 outline-none"
            onChange={(event) => setHighlightsText(event.target.value)}
            placeholder="1行に1つずつ入力"
            value={highlightsText}
          />
        </label>
      </div>

      <button
        className="mt-4 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
        disabled={isPending || !session?.access_token}
        onClick={() => {
          setError("");
          setMessage("");
          startTransition(async () => {
            const response = await fetch("/api/knowledge", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${session?.access_token ?? ""}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                submissionId: submission.id,
                title,
                summary,
                highlights: highlightsText
                  .split("\n")
                  .map((item) => item.trim())
                  .filter(Boolean),
              }),
            });

            const result = (await response.json()) as { message?: string };

            if (!response.ok) {
              setError(result.message ?? "ナレッジ公開に失敗しました。");
              return;
            }

            setMessage(result.message ?? "ナレッジを公開しました。");
          });
        }}
        type="button"
      >
        {isPending ? "公開中..." : "ナレッジを公開する"}
      </button>

      {error ? <div className="mt-4 rounded-[20px] bg-[var(--warning-soft)] p-4 text-sm text-[var(--warning)]">{error}</div> : null}
      {message ? <div className="mt-4 rounded-[20px] bg-[var(--accent-soft)] p-4 text-sm text-[var(--accent-ink)]">{message}</div> : null}
    </section>
  );
}
