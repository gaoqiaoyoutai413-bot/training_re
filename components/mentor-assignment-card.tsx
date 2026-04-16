"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export function MentorAssignmentCard({
  submissionId,
  assignedMentorId,
  assignedMentorName,
}: {
  submissionId: string;
  assignedMentorId?: string | null;
  assignedMentorName?: string | null;
}) {
  const router = useRouter();
  const { profile, session } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!profile || (profile.role !== "mentor" && profile.role !== "admin")) {
    return null;
  }

  const isAssignedToMe = assignedMentorId === profile.id;

  const updateAssignment = (action: "assign_self" | "clear_assignment") => {
    if (!session?.access_token) {
      setError("ログイン情報を確認できません。");
      return;
    }

    setError("");
    setMessage("");

    startTransition(async () => {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(result.message ?? "担当メンターの更新に失敗しました。");
        return;
      }

      setMessage(result.message ?? "担当メンターを更新しました。");
      router.refresh();
    });
  };

  return (
    <section className="panel rounded-[30px] p-5">
      <div className="eyebrow text-xs text-slate-500">担当メンター</div>
      <h3 className="mt-2 text-xl font-semibold text-[var(--navy)]">受講生の担当設定</h3>
      <div className="mt-4 rounded-[20px] bg-white/80 p-4 text-sm leading-6 text-slate-600">
        現在の担当:
        <span className="ml-2 font-medium text-[var(--navy)]">{assignedMentorName ?? "未設定"}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        ここで設定した担当は、この受講生の提出全体に共通で反映されます。
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {!isAssignedToMe ? (
          <button
            className="rounded-full bg-[var(--navy)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
            disabled={isPending}
            onClick={() => updateAssignment("assign_self")}
            type="button"
          >
            {isPending ? "更新中..." : "自分を担当にする"}
          </button>
        ) : null}

        {(profile.role === "admin" || isAssignedToMe) && assignedMentorId ? (
          <button
            className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-white disabled:opacity-60"
            disabled={isPending}
            onClick={() => updateAssignment("clear_assignment")}
            type="button"
          >
            {isAssignedToMe ? "自分の担当を外す" : "担当を外す"}
          </button>
        ) : null}
      </div>

      {error ? <div className="mt-4 rounded-[20px] bg-[var(--warning-soft)] p-4 text-sm text-[var(--warning)]">{error}</div> : null}
      {message ? <div className="mt-4 rounded-[20px] bg-[var(--accent-soft)] p-4 text-sm text-[var(--accent-ink)]">{message}</div> : null}
    </section>
  );
}
