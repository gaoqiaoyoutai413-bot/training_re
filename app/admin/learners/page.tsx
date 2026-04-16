import { AppShell } from "@/components/app-shell";
import { AdminUserManagement } from "@/components/admin-user-management";
import { SectionHeading } from "@/components/section-heading";

export default function AdminLearnersPage() {
  return (
    <AppShell currentPath="/admin/learners">
      <section className="panel rounded-[34px] p-6 md:p-8">
        <SectionHeading
          eyebrow="ユーザー管理"
          title="ログイン済みユーザーのロールと学習状況を管理する"
          description="profiles と submissions をもとに、管理者がユーザー権限を更新できる画面です。"
        />
        <AdminUserManagement />
      </section>
    </AppShell>
  );
}
