"use client";

import { useState, useTransition } from "react";
import { useAuth } from "@/components/auth-provider";
import { buildSubmissionReadmeTemplate } from "@/lib/readme-template";
import type { Task } from "@/types/domain";

export function SubmissionForm({ tasks }: { tasks: Task[] }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [mockupSummary, setMockupSummary] = useState<string>("");
  const [codeSummary, setCodeSummary] = useState<string>("");
  const [selectedTaskCode, setSelectedTaskCode] = useState<string>("");
  const { profile, session } = useAuth();
  const selectedTask = tasks.find((task) => task.taskCode === selectedTaskCode) ?? tasks[0] ?? null;

  const readmeTemplate = buildSubmissionReadmeTemplate(selectedTask);

  return (
    <form
      className="panel grid gap-6 rounded-[34px] p-6 md:grid-cols-2 md:p-8"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage("");
        setError("");
        const form = event.currentTarget;
        const formData = new FormData(form);
        const mockupFiles = formData.getAll("mockupFiles").filter((entry): entry is File => entry instanceof File && entry.size > 0);

        if (mockupFiles.length === 0) {
          setError("モック画像は最低1枚提出してください。");
          return;
        }

        startTransition(async () => {
          const response = await fetch("/api/submissions", {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${session?.access_token ?? ""}`,
            },
          });

          const result = (await response.json()) as { message?: string };

          if (!response.ok) {
            setError(result.message ?? "提出の保存に失敗しました。");
            return;
          }

          setMessage(result.message ?? "提出を保存しました。");
          form.reset();
          setMockupSummary("");
          setCodeSummary("");
        });
      }}
    >
      <div className="rounded-[28px] bg-white/80 p-5 text-sm leading-6 text-slate-600 md:col-span-2">
        提出者: <span className="font-medium text-[var(--navy)]">{profile?.name ?? "未ログイン"}</span>
        <span className="ml-2 text-xs text-slate-500">{profile?.email}</span>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">対象課題</span>
        <select
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none"
          name="taskCode"
          onChange={(event) => {
            setSelectedTaskCode(event.currentTarget.value);
          }}
          required
        >
          <option value="">課題を選択してください</option>
          {tasks.map((task) => (
            <option key={task.id} value={task.taskCode}>
              {task.taskCode} - {task.title}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 md:col-span-2">
        <span className="text-sm font-medium text-slate-700">モック画像</span>
        <input
          accept=".png,.jpg,.jpeg,.webp"
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none file:mr-4 file:rounded-full file:border-0 file:bg-[var(--navy)] file:px-4 file:py-2 file:text-sm file:text-white"
          multiple
          name="mockupFiles"
          type="file"
          required
          onChange={(event) => {
            const files = Array.from(event.currentTarget.files ?? []);
            if (files.length === 0) {
              setMockupSummary("");
              return;
            }
            setMockupSummary(`${files.length}枚のモック画像を選択中`);
          }}
        />
        <p className="text-xs leading-5 text-slate-500">
          画面モック、実行結果のスクリーンショット、ワイヤーフレームなどを最低1枚提出してください。
        </p>
        {mockupSummary ? <p className="text-xs text-[var(--accent-ink)]">選択中: {mockupSummary}</p> : null}
      </label>

      <label className="space-y-2 md:col-span-2">
        <span className="text-sm font-medium text-slate-700">コード提出リンク</span>
        <input
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none"
          name="sourceCodeUrl"
          placeholder="GitHub / Google Drive / Colab / Apps Script プロジェクトなど"
          type="url"
        />
        <p className="text-xs leading-5 text-slate-500">
          任意です。リポジトリ、Colab、Apps Script、Google Drive など、コードや成果物にたどれるリンクを入れられます。
        </p>
      </label>

      <label className="space-y-2 md:col-span-2">
        <span className="text-sm font-medium text-slate-700">コードファイル</span>
        <input
          accept=".zip,.gs,.js,.ts,.tsx,.py,.html,.css,.json,.md,.ipynb"
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none file:mr-4 file:rounded-full file:border-0 file:bg-[var(--navy)] file:px-4 file:py-2 file:text-sm file:text-white"
          multiple
          name="codeFiles"
          type="file"
          onChange={(event) => {
            const files = Array.from(event.currentTarget.files ?? []);
            if (files.length === 0) {
              setCodeSummary("");
              return;
            }
            setCodeSummary(`${files.length}件のコードファイルを選択中`);
          }}
        />
        <p className="text-xs leading-5 text-slate-500">
          任意です。ZIP 一式、主要ソース、Colab ノートブックなどを添付できます。
        </p>
        {codeSummary ? <p className="text-xs text-[var(--accent-ink)]">選択中: {codeSummary}</p> : null}
      </label>

      {selectedTask ? (
        <div className="rounded-[28px] bg-[var(--sand)] p-5 text-sm leading-6 text-slate-600 md:col-span-2">
          <div className="font-medium text-[var(--navy)]">README テンプレート</div>
          <p className="mt-2 text-xs text-slate-500">
            下の本文欄には、まずこのテンプレートをベースに書くのがおすすめです。AIレビューもこの構造を優先して読みます。
          </p>
          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-[20px] bg-white/80 p-4 text-xs leading-6 text-slate-700">
            {readmeTemplate}
          </pre>
        </div>
      ) : null}

      {selectedTask?.starterKit ? (
        <div className="rounded-[28px] bg-white/80 p-5 text-sm leading-6 text-slate-600 md:col-span-2">
          <div className="font-medium text-[var(--navy)]">事前配布スターターセット</div>
          <p className="mt-2 text-xs text-slate-500">
            テストデータや項目定義を先に配布しています。環境準備よりも実装から入りたいときに使ってください。
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[20px] bg-[var(--sand)] p-4">
              <div className="text-sm font-medium text-slate-700">最初の進め方</div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                {selectedTask.starterKit.setupSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-[20px] bg-[var(--sand)] p-4">
              <div className="text-sm font-medium text-slate-700">配布ファイル</div>
              <div className="mt-3 grid gap-3">
                {selectedTask.starterKit.files.map((file) => (
                  <a
                    key={file.path}
                    className="rounded-[16px] bg-white px-4 py-3 text-sm text-[var(--accent-ink)] transition hover:bg-[var(--accent-soft)]"
                    download
                    href={file.path}
                  >
                    <div className="font-medium">{file.label}</div>
                    <div className="mt-1 text-xs leading-5 text-slate-500">{file.description}</div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <label className="space-y-2 md:col-span-2">
        <span className="text-sm font-medium text-slate-700">README / 提出内容</span>
        <textarea
          className="min-h-56 w-full rounded-[28px] border border-black/10 bg-white px-4 py-4 outline-none"
          name="businessValueText"
          placeholder={readmeTemplate || "課題を選択すると README テンプレートが表示されます"}
          required
        />
        <p className="text-xs leading-5 text-slate-500">
          README は必須です。要件への対応、実装内容、業務価値、改善案まで含めて記載してください。
        </p>
      </label>

      <div className="rounded-[28px] bg-[var(--accent-soft)] p-5 text-sm leading-6 text-[var(--accent-ink)] md:col-span-2">
        この提出フォームでは、README とモック画像を主提出物として扱います。コード提出リンクやコードファイルは任意で追加でき、モック画像は提出詳細画面でシステム内プレビューできます。
      </div>

      {error ? (
        <div className="rounded-[22px] bg-[var(--warning-soft)] p-4 text-sm text-[var(--warning)] md:col-span-2">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-[22px] bg-[var(--accent-soft)] p-4 text-sm text-[var(--accent-ink)] md:col-span-2">
          {message}
        </div>
      ) : null}

      <div className="md:col-span-2">
        <button
          className="rounded-full bg-[var(--navy)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending || !profile || !session?.access_token}
          type="submit"
        >
          {isPending ? "提出を保存中..." : "提出内容を保存する"}
        </button>
      </div>
    </form>
  );
}
