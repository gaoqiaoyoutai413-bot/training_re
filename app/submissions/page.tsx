import { AppShell } from "@/components/app-shell";
import { MySubmissionsBoard } from "@/components/my-submissions-board";
import { SectionHeading } from "@/components/section-heading";

export default function MySubmissionsPage() {
  return (
    <AppShell currentPath="/submissions">
      <section className="panel rounded-[34px] p-6 md:p-8">
        <SectionHeading
          eyebrow="自分の提出"
          title="提出状況を、一覧で横断できる。"
          description="自分が提出した課題だけを一覧で確認できます。AIレビューの有無や、メンターからの返却状況もここから追えます。"
        />
      </section>

      <MySubmissionsBoard />
    </AppShell>
  );
}
