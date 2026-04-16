import { AppShell } from "@/components/app-shell";
import { SectionHeading } from "@/components/section-heading";
import { StatCard } from "@/components/stat-card";
import { tasks } from "@/lib/mock-data";
import { ListChecks, Users, Layers } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  return (
    <AppShell currentPath="/admin">
      <section className="panel rounded-[34px] p-6 md:p-8">
        <SectionHeading
          eyebrow="管理者ダッシュボード"
          title="システム全体の管理と運用設定。"
          description="課題の追加・編集、受講生の進捗管理、バッチ運用などをここから制御します。"
        />
        
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCard label="管理課題数" value={`${tasks.length}`} icon={ListChecks} />
          <StatCard label="アクティブユーザー" value="--" icon={Users} hint="DB同期後に反映" />
          <StatCard label="現在のバッチ" value="--" icon={Layers} hint="運用中のフェーズ" />
        </div>
      </section>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Link href="/admin/tasks" className="panel group flex items-start gap-4 rounded-[30px] p-8 transition-all hover:border-[var(--navy)]">
          <div className="rounded-2xl bg-[var(--sand)] p-4 text-[var(--navy)] group-hover:bg-[var(--navy)] group-hover:text-white transition-colors">
            <ListChecks className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[var(--navy)]">課題管理</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              研修課題のマスタ登録、配点、AIレビューの評価基準（ルーブリック）を編集します。
            </p>
          </div>
        </Link>

        <Link href="/admin/learners" className="panel group flex items-start gap-4 rounded-[30px] p-8 transition-all hover:border-[var(--navy)]">
          <div className="rounded-2xl bg-[var(--sand)] p-4 text-[var(--navy)] group-hover:bg-[var(--navy)] group-hover:text-white transition-colors">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[var(--navy)]">ユーザー管理</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              受講生のステータス変更、メンターの割り当て、所属バッチの管理を行います。
            </p>
          </div>
        </Link>
      </div>
    </AppShell>
  );
}
