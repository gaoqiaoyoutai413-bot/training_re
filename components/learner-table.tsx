 "use client";

import type { LearnerSnapshot, UserRole } from "@/types/domain";

export function LearnerTable({
  learners,
  onRoleChange,
  updatingUserId,
}: {
  learners: LearnerSnapshot[];
  onRoleChange?: (userId: string, role: UserRole) => void;
  updatingUserId?: string | null;
}) {
  if (learners.length === 0) {
    return (
      <div className="panel rounded-[30px] p-6 text-sm text-slate-600">
        受講生データはまだ登録されていません。
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden rounded-[30px]">
      <table className="min-w-full border-collapse text-left">
        <thead className="bg-white/80 text-xs uppercase tracking-[0.12em] text-slate-500">
          <tr>
            <th className="px-5 py-4">ユーザー</th>
            <th className="px-5 py-4">ロール</th>
            <th className="px-5 py-4">完了課題</th>
            <th className="px-5 py-4">レビュー中</th>
            <th className="px-5 py-4">スキル傾向</th>
            <th className="px-5 py-4">現在のテーマ</th>
          </tr>
        </thead>
        <tbody>
          {learners.map((learner) => (
            <tr key={learner.id} className="border-t border-black/5">
              <td className="px-5 py-4">
                <div className="font-medium text-[var(--navy)]">{learner.name}</div>
                <div className="mt-1 text-xs text-slate-500">{learner.email}</div>
              </td>
              <td className="px-5 py-4">
                {onRoleChange ? (
                  <select
                    className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs text-slate-700 outline-none disabled:opacity-60"
                    disabled={updatingUserId === learner.id}
                    onChange={(event) => {
                      onRoleChange(learner.id, event.target.value as UserRole);
                    }}
                    value={learner.role}
                  >
                    <option value="student">student</option>
                    <option value="mentor">mentor</option>
                    <option value="admin">admin</option>
                  </select>
                ) : (
                  learner.role
                )}
              </td>
              <td className="px-5 py-4">{learner.completedTasks} / 10</td>
              <td className="px-5 py-4">{learner.inReviewTasks}</td>
              <td className="px-5 py-4 text-sm text-slate-600">
                A {learner.skillScores.automation} / AI {learner.skillScores.ai} / I {learner.skillScores.integration}
              </td>
              <td className="px-5 py-4 text-sm text-slate-600">{learner.focusArea}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
