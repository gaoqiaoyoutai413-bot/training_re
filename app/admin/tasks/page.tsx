import { AppShell } from "@/components/app-shell";
import { GoogleDocsExportCard } from "@/components/google-docs-export-card";
import { SectionHeading } from "@/components/section-heading";
import { TaskAdminManager } from "@/components/task-admin-manager";
import { getTasks } from "@/lib/task-repository";

export default async function AdminTasksPage() {
  const tasks = await getTasks();

  return (
    <AppShell currentPath="/admin/tasks">
      <section className="panel rounded-[34px] p-6 md:p-8">
        <SectionHeading
          eyebrow="課題管理"
          title="課題マスタを管理画面から更新する"
          description="README テンプレート、合格条件、AIレビュー基準に影響する項目を管理者が更新できる画面です。"
        />
      </section>
      <GoogleDocsExportCard />
      <TaskAdminManager tasks={tasks} />
    </AppShell>
  );
}
