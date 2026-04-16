"use client";

import Link from "next/link";
import { BookOpen, ClipboardCheck, FileText, FolderKanban, Home, ListChecks, Send, UserCog, Users, type LucideIcon } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/domain";

const sectionsByRole: Record<UserRole, Array<{ href: string; label: string; icon: LucideIcon }>> = {
  student: [
    { href: "/", label: "ホーム", icon: Home },
    { href: "/quests", label: "課題一覧", icon: FolderKanban },
    { href: "/submissions/new", label: "課題提出", icon: Send },
    { href: "/submissions", label: "提出状況", icon: FileText },
    { href: "/knowledge", label: "ナレッジ", icon: BookOpen },
  ],
  mentor: [
    { href: "/", label: "ホーム", icon: Home },
    { href: "/quests", label: "課題一覧", icon: FolderKanban },
    { href: "/submissions/new", label: "課題提出", icon: Send },
    { href: "/submissions", label: "提出状況", icon: FileText },
    { href: "/knowledge", label: "ナレッジ", icon: BookOpen },
    { href: "/mentor/assignments", label: "担当設定", icon: UserCog },
    { href: "/mentor/reviews", label: "提出レビュー", icon: ClipboardCheck },
  ],
  admin: [
    { href: "/", label: "ホーム", icon: Home },
    { href: "/knowledge", label: "ナレッジ", icon: BookOpen },
    { href: "/mentor/assignments", label: "担当設定", icon: UserCog },
    { href: "/mentor/reviews", label: "提出レビュー", icon: ClipboardCheck },
    { href: "/admin/tasks", label: "課題管理", icon: ListChecks },
    { href: "/admin/learners", label: "ユーザー管理", icon: Users },
  ],
};

export function AppShell({
  children,
  currentPath,
}: {
  children: React.ReactNode;
  currentPath: string;
}) {
  const { profile, signOut } = useAuth();
  const visibleSections = profile ? sectionsByRole[profile.role] : [];
  const roleCopy =
    profile?.role === "student"
      ? "課題を選び、提出して、返却を確認する流れに絞っています。"
      : profile?.role === "mentor"
        ? "提出とレビューの両方を、この画面群だけで進められる構成です。"
        : "課題管理とユーザー管理を中心に、運営に必要な導線だけを残しています。";

  return (
    <div className="shell-grid min-h-screen px-4 py-6 text-slate-900 md:px-6">
      <div className="mx-auto grid w-full max-w-[2160px] gap-6 lg:grid-cols-[236px_minmax(0,1fr)]">
        <aside className="panel rounded-[32px] border px-5 py-6">
          <div className="mb-8">
            <div className="eyebrow mb-2 text-xs text-slate-500">Tech-Quest</div>
            <h1 className="text-[2rem] font-semibold leading-tight text-[var(--navy)]">研修運用を、見やすく一つに。</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">{roleCopy}</p>
          </div>

          <nav className="space-y-2">
            {visibleSections.map((section) => {
              const Icon = section.icon;
              const active = currentPath === section.href || currentPath.startsWith(`${section.href}/`);

              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 transition",
                    active
                      ? "bg-[var(--accent-soft)] text-[var(--navy)] ring-1 ring-black/5"
                      : "text-slate-700 hover:bg-white/70",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{section.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-[28px] bg-[var(--accent-soft)] p-4 text-sm text-[var(--accent-ink)]">
            <div className="eyebrow text-xs">ログイン中</div>
            <p className="mt-2 font-medium">{profile?.name ?? "未ログイン"}</p>
            <p className="mt-1 text-xs opacity-80">{profile?.email}</p>
            <p className="mt-1 text-xs opacity-80">ロール: {profile?.role ?? "未設定"}</p>
            <button
              className="mt-4 rounded-full bg-[var(--navy)] px-4 py-2 text-xs font-medium text-white transition hover:opacity-90"
              onClick={() => {
                void signOut();
              }}
              type="button"
            >
              ログアウト
            </button>
          </div>
        </aside>

        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
