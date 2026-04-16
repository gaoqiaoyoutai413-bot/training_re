"use client";

import { useState, useTransition } from "react";
import { useAuth } from "@/components/auth-provider";
import type { Task } from "@/types/domain";
import { formatDifficulty, formatTaskCategory } from "@/lib/utils";

type EditableTask = {
  taskCode: string;
  title: string;
  summary: string;
  learningObjective: string;
  businessImpact: string;
  background: string;
  specificIssue: string;
  finalGoal: string;
  learnerActions: string[];
  deliverables: string[];
  businessValueChecks: string[];
  acceptanceCriteria: Task["acceptanceCriteria"];
  aiReviewRubric: Task["aiReviewRubric"];
};

function toMultiline(value: string[]) {
  return value.join("\n");
}

function fromMultiline(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toEditableTask(task: Task): EditableTask {
  return {
    taskCode: task.taskCode,
    title: task.title,
    summary: task.summary,
    learningObjective: task.learningObjective,
    businessImpact: task.businessImpact,
    background: task.background ?? "",
    specificIssue: task.specificIssue ?? "",
    finalGoal: task.finalGoal ?? "",
    learnerActions: task.learnerActions,
    deliverables: task.deliverables,
    businessValueChecks: task.businessValueChecks,
    acceptanceCriteria: task.acceptanceCriteria,
    aiReviewRubric: task.aiReviewRubric,
  };
}

export function TaskAdminManager({ tasks }: { tasks: Task[] }) {
  const { session } = useAuth();
  const [selectedTaskCode, setSelectedTaskCode] = useState(tasks[0]?.taskCode ?? "");
  const [draft, setDraft] = useState<EditableTask | null>(tasks[0] ? toEditableTask(tasks[0]) : null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedTask = tasks.find((task) => task.taskCode === selectedTaskCode) ?? null;

  return (
    <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
      <section className="panel rounded-[30px] p-5">
        <div className="eyebrow text-xs text-slate-500">公開中の課題</div>
        <h3 className="mt-2 text-xl font-semibold text-[var(--navy)]">課題マスタ一覧</h3>
        <div className="mt-4 space-y-3">
          {tasks.map((task) => {
            const active = task.taskCode === selectedTaskCode;
            return (
              <button
                key={task.id}
                className={`w-full rounded-[22px] border p-4 text-left transition ${
                  active ? "border-[var(--navy)] bg-white" : "border-black/5 bg-white/70 hover:bg-white"
                }`}
                onClick={() => {
                  setSelectedTaskCode(task.taskCode);
                  setDraft(toEditableTask(task));
                  setMessage("");
                  setError("");
                }}
                type="button"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-[var(--navy)]">{task.taskCode}</div>
                  <div className="text-xs text-slate-500">{formatDifficulty(task.difficulty)}</div>
                </div>
                <div className="mt-2 text-sm leading-5 text-slate-700">{task.title}</div>
                <div className="mt-2 text-xs text-slate-500">{formatTaskCategory(task.category)}</div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel rounded-[30px] p-5">
        {draft && selectedTask ? (
          <>
            <div className="eyebrow text-xs text-slate-500">課題編集</div>
            <h3 className="mt-2 text-xl font-semibold text-[var(--navy)]">{selectedTask.taskCode}</h3>
            <p className="mt-1 text-sm text-slate-600">README テンプレートや AIレビュー基準に影響する項目を編集できます。</p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">課題名</span>
                <input
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none"
                  value={draft.title}
                  onChange={(event) => setDraft((current) => (current ? { ...current, title: event.target.value } : current))}
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">概要</span>
                <textarea
                  className="min-h-24 w-full rounded-[24px] border border-black/10 bg-white px-4 py-4 outline-none"
                  value={draft.summary}
                  onChange={(event) => setDraft((current) => (current ? { ...current, summary: event.target.value } : current))}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">学習目的</span>
                <textarea
                  className="min-h-24 w-full rounded-[24px] border border-black/10 bg-white px-4 py-4 outline-none"
                  value={draft.learningObjective}
                  onChange={(event) =>
                    setDraft((current) => (current ? { ...current, learningObjective: event.target.value } : current))
                  }
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">ビジネス価値</span>
                <textarea
                  className="min-h-24 w-full rounded-[24px] border border-black/10 bg-white px-4 py-4 outline-none"
                  value={draft.businessImpact}
                  onChange={(event) => setDraft((current) => (current ? { ...current, businessImpact: event.target.value } : current))}
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">背景・導入前の状況</span>
                <textarea
                  className="min-h-28 w-full rounded-[24px] border border-black/10 bg-white px-4 py-4 outline-none"
                  value={draft.background}
                  onChange={(event) => setDraft((current) => (current ? { ...current, background: event.target.value } : current))}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">解決したい具体的な課題</span>
                <textarea
                  className="min-h-28 w-full rounded-[24px] border border-black/10 bg-white px-4 py-4 outline-none"
                  value={draft.specificIssue}
                  onChange={(event) => setDraft((current) => (current ? { ...current, specificIssue: event.target.value } : current))}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">最終解決（ゴール）</span>
                <textarea
                  className="min-h-28 w-full rounded-[24px] border border-black/10 bg-white px-4 py-4 outline-none"
                  value={draft.finalGoal}
                  onChange={(event) => setDraft((current) => (current ? { ...current, finalGoal: event.target.value } : current))}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">受講生がやること</span>
                <textarea
                  className="min-h-36 w-full rounded-[24px] border border-black/10 bg-white px-4 py-4 outline-none"
                  value={toMultiline(draft.learnerActions)}
                  onChange={(event) =>
                    setDraft((current) => (current ? { ...current, learnerActions: fromMultiline(event.target.value) } : current))
                  }
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">提出物</span>
                <textarea
                  className="min-h-36 w-full rounded-[24px] border border-black/10 bg-white px-4 py-4 outline-none"
                  value={toMultiline(draft.deliverables)}
                  onChange={(event) =>
                    setDraft((current) => (current ? { ...current, deliverables: fromMultiline(event.target.value) } : current))
                  }
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">必須機能</span>
                <textarea
                  className="min-h-32 w-full rounded-[24px] border border-black/10 bg-white px-4 py-4 outline-none"
                  value={toMultiline(draft.acceptanceCriteria.mustHave)}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? {
                            ...current,
                            acceptanceCriteria: {
                              ...current.acceptanceCriteria,
                              mustHave: fromMultiline(event.target.value),
                            },
                          }
                        : current,
                    )
                  }
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">最低限のエラーハンドリング</span>
                <textarea
                  className="min-h-32 w-full rounded-[24px] border border-black/10 bg-white px-4 py-4 outline-none"
                  value={toMultiline(draft.acceptanceCriteria.minimumErrorHandling)}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? {
                            ...current,
                            acceptanceCriteria: {
                              ...current.acceptanceCriteria,
                              minimumErrorHandling: fromMultiline(event.target.value),
                            },
                          }
                        : current,
                    )
                  }
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">提出必須要素</span>
                <textarea
                  className="min-h-32 w-full rounded-[24px] border border-black/10 bg-white px-4 py-4 outline-none"
                  value={toMultiline(draft.acceptanceCriteria.requiredSubmissionItems)}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? {
                            ...current,
                            acceptanceCriteria: {
                              ...current.acceptanceCriteria,
                              requiredSubmissionItems: fromMultiline(event.target.value),
                            },
                          }
                        : current,
                    )
                  }
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">AIレビュー観点</span>
                <textarea
                  className="min-h-32 w-full rounded-[24px] border border-black/10 bg-white px-4 py-4 outline-none"
                  value={draft.aiReviewRubric.map((item) => `${item.title}: ${item.description}`).join("\n")}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? {
                            ...current,
                            aiReviewRubric: fromMultiline(event.target.value).map((line) => {
                              const [title, ...rest] = line.split(":");
                              return {
                                title: title?.trim() ?? "",
                                description: rest.join(":").trim(),
                              };
                            }),
                          }
                        : current,
                    )
                  }
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">ビジネス価値チェック</span>
                <textarea
                  className="min-h-24 w-full rounded-[24px] border border-black/10 bg-white px-4 py-4 outline-none"
                  value={toMultiline(draft.businessValueChecks)}
                  onChange={(event) =>
                    setDraft((current) =>
                      current ? { ...current, businessValueChecks: fromMultiline(event.target.value) } : current,
                    )
                  }
                />
              </label>
            </div>

            {error ? <div className="mt-4 rounded-[20px] bg-[var(--warning-soft)] p-4 text-sm text-[var(--warning)]">{error}</div> : null}
            {message ? (
              <div className="mt-4 rounded-[20px] bg-[var(--accent-soft)] p-4 text-sm text-[var(--accent-ink)]">{message}</div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                className="rounded-full bg-[var(--navy)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isPending || !session?.access_token}
                onClick={() => {
                  if (!draft) {
                    return;
                  }

                  setMessage("");
                  setError("");

                  startTransition(async () => {
                    const response = await fetch(`/api/tasks/${draft.taskCode}`, {
                      method: "PATCH",
                      headers: {
                        Authorization: `Bearer ${session?.access_token ?? ""}`,
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(draft),
                    });

                    const result = (await response.json()) as { message?: string };

                    if (!response.ok) {
                      setError(result.message ?? "課題更新に失敗しました。");
                      return;
                    }

                    setMessage(result.message ?? "課題を更新しました。");
                  });
                }}
                type="button"
              >
                {isPending ? "保存中..." : "課題を保存する"}
              </button>
            </div>
          </>
        ) : (
          <div className="text-sm text-slate-600">編集する課題を選択してください。</div>
        )}
      </section>
    </div>
  );
}
