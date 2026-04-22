"use client";

import { useState, useTransition } from "react";
import { useAuth } from "@/components/auth-provider";
import { DEMO_MODE } from "@/lib/demo-mode";

type ExportState = {
  requirements?: string | null;
  design?: string | null;
  brief?: string | null;
};

export function GoogleDocsExportCard() {
  const { session } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [links, setLinks] = useState<ExportState>({});

  const runExport = (target: "requirements" | "design" | "brief") => {
    if (!session?.access_token) {
      setError("ログイン情報を確認できません。");
      return;
    }

    if (DEMO_MODE) {
      setError("デモモードでは Google ドキュメント出力を停止しています。");
      return;
    }

    setError("");
    setMessage("");

    startTransition(async () => {
      const response = await fetch("/api/docs/google-export", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ target }),
      });

      const result = (await response.json()) as { message?: string; webViewLink?: string | null };

      if (!response.ok) {
        setError(result.message ?? "Google ドキュメント出力に失敗しました。");
        return;
      }

      setLinks((current) => ({ ...current, [target]: result.webViewLink ?? null }));
      setMessage(result.message ?? "Google ドキュメントへ出力しました。");
    });
  };

  return (
    <section className="panel rounded-[30px] p-5">
      <div className="eyebrow text-xs text-slate-500">Google Docs 出力</div>
      <h3 className="mt-2 text-lg font-semibold text-[var(--navy)]">整形済みの社内共有資料を Google ドキュメントへ出す</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        リポジトリ内の整理済み Markdown をもとに、見出しと箇条書きを整えた Google ドキュメントを Google Drive 上へ生成します。
      </p>
      {DEMO_MODE ? (
        <div className="mt-4 rounded-[20px] bg-white/80 p-4 text-sm leading-6 text-slate-600">
          就活用デモでは外部の Google Workspace 連携を停止しています。
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <button
          className="rounded-[20px] bg-[var(--navy)] px-5 py-4 text-left text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
          disabled={DEMO_MODE || isPending}
          onClick={() => runExport("requirements")}
          type="button"
        >
          <div>要件定義書を出力</div>
          <div className="mt-1 text-xs text-white/75">背景、目的、機能要件、公開方針をまとめて出力します。</div>
        </button>
        <button
          className="rounded-[20px] border border-black/10 px-5 py-4 text-left text-sm font-medium text-slate-700 transition hover:bg-white disabled:opacity-60"
          disabled={DEMO_MODE || isPending}
          onClick={() => runExport("design")}
          type="button"
        >
          <div>設計書を出力</div>
          <div className="mt-1 text-xs text-slate-500">画面、認証、データモデル、API の整理版を出力します。</div>
        </button>
        <button
          className="rounded-[20px] border border-black/10 px-5 py-4 text-left text-sm font-medium text-slate-700 transition hover:bg-white disabled:opacity-60"
          disabled={DEMO_MODE || isPending}
          onClick={() => runExport("brief")}
          type="button"
        >
          <div>社内説明用サマリーを出力</div>
          <div className="mt-1 text-xs text-slate-500">概要、良さ、対象者、構成を短く共有する資料を出力します。</div>
        </button>
      </div>

      {links.requirements ? (
        <a className="mt-4 block text-sm text-[var(--accent-ink)] underline-offset-4 hover:underline" href={links.requirements} rel="noreferrer" target="_blank">
          要件定義書を開く
        </a>
      ) : null}
      {links.design ? (
        <a className="mt-2 block text-sm text-[var(--accent-ink)] underline-offset-4 hover:underline" href={links.design} rel="noreferrer" target="_blank">
          設計書を開く
        </a>
      ) : null}
      {links.brief ? (
        <a className="mt-2 block text-sm text-[var(--accent-ink)] underline-offset-4 hover:underline" href={links.brief} rel="noreferrer" target="_blank">
          社内説明用サマリーを開く
        </a>
      ) : null}

      {error ? <div className="mt-4 rounded-[20px] bg-[var(--warning-soft)] p-4 text-sm text-[var(--warning)]">{error}</div> : null}
      {message ? <div className="mt-4 rounded-[20px] bg-[var(--accent-soft)] p-4 text-sm text-[var(--accent-ink)]">{message}</div> : null}
    </section>
  );
}
