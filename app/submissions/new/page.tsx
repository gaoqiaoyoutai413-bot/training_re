import { AppShell } from "@/components/app-shell";
import { SectionHeading } from "@/components/section-heading";
import { SubmissionForm } from "@/components/submission-form";
import { getTasks } from "@/lib/task-repository";

export default async function NewSubmissionPage() {
  const tasks = await getTasks();

  return (
    <AppShell currentPath="/submissions/new">
      <section className="panel rounded-[34px] p-6 md:p-8">
        <SectionHeading
          eyebrow="課題提出"
          title="README とモック画像で、提出内容を伝える。"
          description="この提出フォームでは README とモック画像を必須にしています。実装内容、要件への対応、業務価値、画面イメージをまとめて提出してください。"
        />
      </section>

      <SubmissionForm tasks={tasks} />
    </AppShell>
  );
}
