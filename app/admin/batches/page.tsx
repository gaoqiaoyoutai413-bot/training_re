import { AppShell } from "@/components/app-shell";
import { SectionHeading } from "@/components/section-heading";

export default function AdminBatchesPage() {
  return (
    <AppShell currentPath="/admin/batches">
      <section className="panel rounded-[34px] p-6 md:p-8">
        <SectionHeading
          eyebrow="運用メモ"
          title="期別管理は利用しない運用に切り替えました。"
          description="現在の Tech-Quest では、提出とレビューをユーザー単位で管理しています。期の登録や集計は不要です。"
        />
      </section>

      <div className="grid gap-4">
        <div className="panel rounded-[28px] p-6 text-sm leading-7 text-slate-600">
          `batches` と `batch_members` は既存データとの互換のために残っていますが、アプリの通常運用では参照しません。
          以後の提出保存・一覧表示・担当割り当ては、すべてユーザー単位で動きます。
        </div>
      </div>
    </AppShell>
  );
}
