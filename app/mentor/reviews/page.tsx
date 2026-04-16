import { AppShell } from "@/components/app-shell";
import { MentorReviewBoard } from "@/components/mentor-review-board";
import { SectionHeading } from "@/components/section-heading";

export default function MentorReviewsPage() {
  return (
    <AppShell currentPath="/mentor/reviews">
      <section className="panel rounded-[34px] p-6 md:p-8">
        <SectionHeading
          eyebrow="レビュー管理"
          title="担当を持って、レビューを迷わず進める。"
          description="受講生名で検索しながら、自分の担当だけに絞ってレビューできます。担当の割り当ては専用の担当設定ページから行います。"
        />
      </section>

      <MentorReviewBoard />
    </AppShell>
  );
}
