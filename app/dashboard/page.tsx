import { AppShell } from "@/components/app-shell";
import { SectionHeading } from "@/components/section-heading";
import { StudentDashboardBoard } from "@/components/student-dashboard-board";
import { getTasks } from "@/lib/task-repository";

export default async function DashboardPage() {
  const tasks = await getTasks();
  return (
    <AppShell currentPath="/dashboard">
      <section className="panel rounded-[34px] p-6 md:p-8">
        <SectionHeading
          eyebrow="受講生ダッシュボード"
          title="現在地と、次に伸ばすべき領域が見える。"
          description="提出実績からスキル傾向と次の候補課題を計算し、README とモック画像中心の提出フローにつなげます。"
        />
      </section>

      <StudentDashboardBoard taskCount={tasks.length} />
    </AppShell>
  );
}
