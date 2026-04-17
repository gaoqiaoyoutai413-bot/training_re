import Link from "next/link";
import { Task } from "@/types/domain";
import { formatDifficulty } from "@/lib/utils";

export function TaskAdminTable({ tasks }: { tasks: Task[] }) {
  return (
    <div className="panel overflow-hidden rounded-[30px]">
      <table className="min-w-full border-collapse text-left">
        <thead className="bg-white/90 text-xs uppercase tracking-[0.12em] text-slate-600">
          <tr>
            <th className="px-5 py-4">Task</th>
            <th className="px-5 py-4">Category</th>
            <th className="px-5 py-4">Difficulty</th>
            <th className="px-5 py-4">Impact</th>
            <th className="px-5 py-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-t border-black/5">
              <td className="px-5 py-4">
                <div className="font-medium text-[var(--navy)]">{task.taskCode}</div>
                <div className="text-sm text-slate-600">{task.title}</div>
              </td>
              <td className="px-5 py-4 capitalize">{task.category}</td>
              <td className="px-5 py-4">{formatDifficulty(task.difficulty)}</td>
              <td className="px-5 py-4 text-sm text-slate-600">{task.businessImpact}</td>
              <td className="px-5 py-4">
                <Link className="inline-flex rounded-full bg-[var(--navy)] px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90" href={`/quests/${task.taskCode}`}>
                  詳細を見る
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
