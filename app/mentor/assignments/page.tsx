import { AppShell } from "@/components/app-shell";
import { AssignmentManager } from "@/components/assignment-manager";
import { SectionHeading } from "@/components/section-heading";

export default function MentorAssignmentsPage() {
  return (
    <AppShell currentPath="/mentor/assignments">
      <section className="panel rounded-[34px] p-6 md:p-8">
        <SectionHeading
          eyebrow="担当設定"
          title="ユーザー単位で担当メンターを決める"
          description="レビュー画面から切り離して、mentor と admin が人単位で担当を管理するための専用ページです。"
        />
      </section>

      <AssignmentManager />
    </AppShell>
  );
}
