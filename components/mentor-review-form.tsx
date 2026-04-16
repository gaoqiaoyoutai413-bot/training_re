"use client";

import { useState, useTransition } from "react";
import { useAuth } from "@/components/auth-provider";

export function MentorReviewForm({ submissionId }: { submissionId: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { profile, session } = useAuth();

  return (
    <form
      className="panel rounded-[30px] p-5"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage("");
        setError("");
        const form = event.currentTarget;
        const formData = new FormData(form);

        startTransition(async () => {
          const response = await fetch("/api/reviews", {
            method: "POST",
            body: JSON.stringify({
              submissionId,
              technicalScore: Number(formData.get("technicalScore") ?? 0),
              businessScore: Number(formData.get("businessScore") ?? 0),
              result: String(formData.get("result") ?? ""),
              comment: String(formData.get("comment") ?? "").trim(),
            }),
            headers: {
              Authorization: `Bearer ${session?.access_token ?? ""}`,
              "Content-Type": "application/json",
            },
          });

          const result = (await response.json()) as { message?: string };

          if (!response.ok) {
            setError(result.message ?? "レビューの保存に失敗しました。");
            return;
          }

          setMessage(result.message ?? "レビューを保存しました。");
          window.location.reload();
        });
      }}
    >
      <div className="eyebrow text-xs text-slate-500">レビュー入力</div>
      <h3 className="mt-2 text-xl font-semibold text-[var(--navy)]">メンター採点を登録する</h3>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <div className="rounded-[20px] bg-white/80 p-4 text-sm leading-5 text-slate-600 md:col-span-2">
          レビュー担当: <span className="font-medium text-[var(--navy)]">{profile?.name ?? "未ログイン"}</span>
          <span className="ml-2 text-xs text-slate-500">{profile?.email}</span>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">技術点</span>
          <select className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none" name="technicalScore" required>
            {[5, 4, 3, 2, 1].map((score) => (
              <option key={score} value={score}>
                {score}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">ビジネス点</span>
          <select className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none" name="businessScore" required>
            {[5, 4, 3, 2, 1].map((score) => (
              <option key={score} value={score}>
                {score}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">判定</span>
          <select className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none" name="result" required>
            <option value="passed">合格</option>
            <option value="rework_requested">差し戻し</option>
          </select>
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">コメント</span>
          <textarea
            className="min-h-40 w-full rounded-[24px] border border-black/10 bg-white px-4 py-4 outline-none"
            name="comment"
            placeholder="評価理由、良かった点、再提出時に見てほしい点を記載"
            required
          />
        </label>
      </div>

      {error ? (
        <div className="mt-4 rounded-[20px] bg-[var(--warning-soft)] p-4 text-sm text-[var(--warning)]">{error}</div>
      ) : null}

      {message ? (
        <div className="mt-4 rounded-[20px] bg-[var(--accent-soft)] p-4 text-sm text-[var(--accent-ink)]">{message}</div>
      ) : null}

      <div className="mt-4">
        <button
          className="rounded-full bg-[var(--navy)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending || !profile || !session?.access_token}
          type="submit"
        >
          {isPending ? "レビューを保存中..." : "レビューを保存する"}
        </button>
      </div>
    </form>
  );
}
