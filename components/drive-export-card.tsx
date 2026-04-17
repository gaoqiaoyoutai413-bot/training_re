"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useAuth } from "@/components/auth-provider";
import type { Submission } from "@/types/domain";

export function DriveExportCard({ submission }: { submission: Submission }) {
  const router = useRouter();
  const { profile, session } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!profile) {
    return null;
  }

  const isAdmin = profile.role === "admin";
  const folderUrl = submission.driveFolderId ? `https://drive.google.com/drive/folders/${submission.driveFolderId}` : null;

  return (
    <div className="panel rounded-[30px] p-5">
      <div className="eyebrow text-xs text-slate-500">Drive 退避</div>
      <h3 className="mt-2 text-lg font-semibold text-[var(--navy)]">長期保管ステータス</h3>

      <div className="mt-4 grid gap-3">
        <div className="rounded-[20px] bg-white/80 p-4">
          <div className="text-xs text-slate-500">退避状態</div>
          <div className="mt-1 text-base font-semibold text-[var(--navy)]">{submission.driveExportStatus ?? "未実行"}</div>
        </div>

        {submission.driveExportedAt ? (
          <div className="rounded-[20px] bg-white/80 p-4">
            <div className="text-xs text-slate-500">退避完了日時</div>
            <div className="mt-1 text-sm text-slate-700">{submission.driveExportedAt}</div>
          </div>
        ) : null}

        {folderUrl ? (
          <a
            className="rounded-[20px] bg-white/80 p-4 text-sm leading-6 text-[var(--accent-ink)] underline-offset-4 hover:underline"
            href={folderUrl}
            rel="noreferrer"
            target="_blank"
          >
            Google Drive フォルダを開く
          </a>
        ) : null}

        {submission.driveExportError ? (
          <div className="rounded-[20px] bg-[var(--warning-soft)] p-4 text-sm text-[var(--warning)]">
            {submission.driveExportError}
          </div>
        ) : null}
      </div>

      {isAdmin ? (
        <div className="mt-4">
          <button
            className="rounded-full bg-[var(--navy)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending || !session?.access_token || submission.status !== "passed"}
            onClick={() => {
              setMessage("");
              setError("");

              startTransition(async () => {
                const response = await fetch(`/api/submissions/${submission.id}/drive-export`, {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${session?.access_token ?? ""}`,
                  },
                });

                const result = (await response.json()) as { message?: string };

                if (!response.ok) {
                  setError(result.message ?? "Drive 退避の再実行に失敗しました。");
                  return;
                }

                setMessage(result.message ?? "Drive 退避を再実行しました。");
                router.refresh();
              });
            }}
            type="button"
          >
            {isPending ? "再実行中..." : "Drive 退避を再実行"}
          </button>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            admin のみ再実行できます。合格済み提出のみ対象です。
          </p>
        </div>
      ) : null}

      {message ? <div className="mt-4 rounded-[20px] bg-[var(--accent-soft)] p-4 text-sm text-[var(--accent-ink)]">{message}</div> : null}
      {error ? <div className="mt-4 rounded-[20px] bg-[var(--warning-soft)] p-4 text-sm text-[var(--warning)]">{error}</div> : null}
    </div>
  );
}
