import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { SectionHeading } from "@/components/section-heading";
import { getTasks } from "@/lib/task-repository";
import { formatDifficulty, formatTaskCategory } from "@/lib/utils";

function getPreviewType(path: string) {
  const normalized = path.toLowerCase();

  if (normalized.endsWith(".pdf")) {
    return "pdf";
  }

  if (
    normalized.endsWith(".png") ||
    normalized.endsWith(".jpg") ||
    normalized.endsWith(".jpeg") ||
    normalized.endsWith(".webp") ||
    normalized.endsWith(".svg")
  ) {
    return "image";
  }

  return null;
}

export default async function QuestDetailPage({
  params,
}: {
  params: Promise<{ taskCode: string }>;
}) {
  const { taskCode } = await params;
  const tasks = await getTasks();
  const task = tasks.find((item) => item.taskCode === taskCode);

  if (!task) {
    notFound();
  }

  const relatedTasks = tasks.filter((item) =>
    task.recommendedDependencies.some((dependency) => dependency.taskCode === item.taskCode),
  );
  const previewableStarterFiles = task.starterKit?.files.filter((file) => getPreviewType(file.path)) ?? [];

  return (
    <AppShell currentPath="/quests">
      <section className="panel rounded-[34px] p-6 md:p-8">
        <SectionHeading
          eyebrow={`${task.taskCode} / 課題詳細`}
          title={task.title}
          description={task.summary}
        />
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
          <span className="rounded-full bg-white px-4 py-2">{formatTaskCategory(task.category)}</span>
          <span className="rounded-full bg-white px-4 py-2">{formatDifficulty(task.difficulty)}</span>
          <span className="rounded-full bg-white px-4 py-2">{task.estimatedHours}h 想定</span>
        </div>
        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          <div className="rounded-[24px] bg-white/85 p-4">
            <div className="eyebrow text-[10px] text-slate-500">Learning Objective</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{task.learningObjective}</p>
          </div>
          <div className="rounded-[24px] bg-white/85 p-4">
            <div className="eyebrow text-[10px] text-slate-500">Business Impact</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{task.businessImpact}</p>
          </div>
          <div className="rounded-[24px] bg-[var(--accent-soft)] p-4">
            <div className="eyebrow text-[10px] text-[var(--accent-ink)]">Business Value</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {task.businessValueChecks.map((item) => (
                <span key={item} className="rounded-full bg-white px-3 py-1 text-xs text-[var(--accent-ink)]">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="space-y-5">
          {task.background || task.specificIssue || task.finalGoal ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {task.background ? (
                <div className="panel rounded-[30px] p-5">
                  <div className="eyebrow text-xs text-slate-500">背景</div>
                  <h3 className="mt-2 text-lg font-semibold text-[var(--navy)]">背景・導入前の状況</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{task.background}</p>
                </div>
              ) : null}
              {task.specificIssue ? (
                <div className="panel rounded-[30px] p-5">
                  <div className="eyebrow text-xs text-slate-500">課題</div>
                  <h3 className="mt-2 text-lg font-semibold text-[var(--navy)]">解決したい具体的な課題</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{task.specificIssue}</p>
                </div>
              ) : null}
              {task.finalGoal ? (
                <div className="panel rounded-[30px] p-5">
                  <div className="eyebrow text-xs text-slate-500">ゴール</div>
                  <h3 className="mt-2 text-lg font-semibold text-[var(--navy)]">最終解決（ゴール）</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{task.finalGoal}</p>
                </div>
              ) : null}
            </div>
          ) : null}

          {task.starterKit ? (
            <div className="panel rounded-[30px] p-5">
              <div className="eyebrow text-xs text-slate-500">スターターセット</div>
              <h3 className="mt-2 text-xl font-semibold text-[var(--navy)]">{task.starterKit.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{task.starterKit.description}</p>

              <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-[22px] bg-white/80 p-4">
                  <div className="text-sm font-medium text-slate-700">開発を始める前の手順</div>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                    {task.starterKit.setupSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[22px] bg-white/80 p-4">
                  <div className="text-sm font-medium text-slate-700">配布ファイル</div>
                  <div className="mt-3 grid gap-3">
                    {task.starterKit.files.map((file) => (
                      <div
                        key={file.path}
                        className="rounded-[18px] border border-black/5 bg-white px-4 py-3 text-sm text-[var(--accent-ink)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium">{file.label}</div>
                            <div className="mt-1 text-xs leading-5 text-slate-500">{file.description}</div>
                          </div>
                          <a
                            className="shrink-0 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent-ink)] transition hover:opacity-85"
                            download
                            href={file.path}
                          >
                            開く / 保存
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {previewableStarterFiles.length > 0 ? (
                <div className="mt-4 rounded-[22px] bg-white/80 p-4">
                  <div className="text-sm font-medium text-slate-700">素材プレビュー</div>
                  <div className="mt-3 grid gap-4 xl:grid-cols-2">
                    {previewableStarterFiles.map((file) => {
                      const previewType = getPreviewType(file.path);

                      return (
                        <div key={file.path} className="overflow-hidden rounded-[20px] border border-black/5 bg-white">
                          <div className="border-b border-black/5 px-4 py-3">
                            <div className="font-medium text-[var(--navy)]">{file.label}</div>
                            <div className="mt-1 text-xs leading-5 text-slate-500">{file.description}</div>
                          </div>

                          {previewType === "image" ? (
                            <div className="bg-slate-50 p-4">
                              <img
                                alt={file.label}
                                className="h-auto max-h-[420px] w-full rounded-[16px] border border-black/5 object-contain"
                                src={file.path}
                              />
                            </div>
                          ) : previewType === "pdf" ? (
                            <div className="bg-slate-50 p-4">
                              <iframe
                                className="h-[420px] w-full rounded-[16px] border border-black/5 bg-white"
                                src={`${file.path}#toolbar=0&navpanes=0&scrollbar=1`}
                                title={file.label}
                              />
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="panel rounded-[30px] p-5">
              <div className="eyebrow text-xs text-slate-500">実装範囲</div>
              <h3 className="mt-2 text-xl font-semibold text-[var(--navy)]">受講生にやってほしいこと</h3>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
                {task.learnerActions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="panel rounded-[30px] p-5">
              <div className="eyebrow text-xs text-slate-500">提出物</div>
              <h3 className="mt-2 text-xl font-semibold text-[var(--navy)]">提出物</h3>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
                {task.deliverables.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="panel rounded-[30px] p-5">
            <div className="eyebrow text-xs text-slate-500">合格条件</div>
            <h3 className="mt-2 text-xl font-semibold text-[var(--navy)]">課題ごとの合格条件</h3>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <div className="rounded-[22px] bg-white/80 p-4">
                <div className="text-sm font-medium text-slate-700">必須機能</div>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  {task.acceptanceCriteria.mustHave.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[22px] bg-white/80 p-4">
                <div className="text-sm font-medium text-slate-700">最低限のエラーハンドリング</div>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  {task.acceptanceCriteria.minimumErrorHandling.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[22px] bg-white/80 p-4">
                <div className="text-sm font-medium text-slate-700">提出物の必須要素</div>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  {task.acceptanceCriteria.requiredSubmissionItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="panel rounded-[30px] p-5">
            <div className="eyebrow text-xs text-slate-500">レビュー観点</div>
            <h3 className="mt-2 text-xl font-semibold text-[var(--navy)]">評価観点</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {task.rubricHighlights.map((item) => (
                <span key={item} className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs text-[var(--accent-ink)]">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="panel rounded-[30px] p-5">
            <div className="eyebrow text-xs text-slate-500">AI一次レビュー</div>
            <h3 className="mt-2 text-xl font-semibold text-[var(--navy)]">AI一次レビュー Rubric（5段階評価）</h3>
            <div className="mt-4 grid gap-3">
              {task.aiReviewRubric.map((criterion) => (
                <div key={criterion.title} className="rounded-[20px] bg-white/80 p-4">
                  <div className="text-sm font-medium text-slate-700">{criterion.title}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">{criterion.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel rounded-[30px] p-5">
            <div className="eyebrow text-xs text-slate-500">メンター評価</div>
            <h3 className="mt-2 text-xl font-semibold text-[var(--navy)]">メンター評価シート</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-[20px] bg-white/80 p-4">
                <div className="text-sm font-medium text-slate-700">技術点（/5）</div>
                <div className="mt-2 text-sm leading-6 text-slate-600">{task.mentorEvaluationSheet.technicalPointLabel}</div>
              </div>
              <div className="rounded-[20px] bg-white/80 p-4">
                <div className="text-sm font-medium text-slate-700">ビジネス点（/5）</div>
                <div className="mt-2 text-sm leading-6 text-slate-600">{task.mentorEvaluationSheet.businessPointLabel}</div>
              </div>
              <div className="rounded-[20px] bg-white/80 p-4 md:col-span-2">
                <div className="text-sm font-medium text-slate-700">差し戻し理由（例）</div>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  {task.mentorEvaluationSheet.returnReasons.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[20px] bg-[var(--accent-soft)] p-4 md:col-span-2">
                <div className="text-sm font-medium text-[var(--accent-ink)]">コメントテンプレ</div>
                <div className="mt-2 text-sm leading-6 text-[var(--accent-ink)]">
                  {task.mentorEvaluationSheet.commentTemplate}
                </div>
              </div>
            </div>
          </div>

          <div className="panel rounded-[30px] p-5">
            <div className="eyebrow text-xs text-slate-500">推奨ルート</div>
            <h3 className="mt-2 text-xl font-semibold text-[var(--navy)]">推奨事前クエスト</h3>
            <div className="mt-4 grid gap-3">
              {task.recommendedDependencies.length > 0 ? (
                task.recommendedDependencies.map((dependency) => (
                  <div key={dependency.taskCode} className="rounded-[20px] bg-white/80 p-4">
                    <div className="font-medium text-[var(--navy)]">{dependency.taskCode}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-600">{dependency.reason}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-[20px] bg-white/80 p-4 text-sm text-slate-600">単独で着手できる課題です。</div>
              )}
            </div>
            <div className="eyebrow mt-6 text-xs text-slate-500">関連知識</div>
            <h3 className="mt-2 text-xl font-semibold text-[var(--navy)]">関連する事前知識</h3>
            <div className="mt-4 grid gap-3">
              {relatedTasks.length > 0 ? (
                relatedTasks.map((item) => (
                  <Link key={item.id} className="block rounded-[20px] bg-white/80 p-4" href={`/quests/${item.taskCode}`}>
                    <div className="font-medium text-[var(--navy)]">{item.taskCode}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-600">{item.title}</div>
                  </Link>
                ))
              ) : (
                <div className="rounded-[20px] bg-white/80 p-4 text-sm text-slate-600">関連課題はありません。</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
