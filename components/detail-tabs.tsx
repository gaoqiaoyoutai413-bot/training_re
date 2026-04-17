"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type DetailTab = {
  id: string;
  label: string;
  note?: string;
  content: React.ReactNode;
};

export function DetailTabs({
  title,
  description,
  tabs,
}: {
  title: string;
  description?: string;
  tabs: DetailTab[];
}) {
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? "");
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

  if (!activeTab) {
    return null;
  }

  return (
    <section className="panel rounded-[30px] p-5">
      <div className="eyebrow text-xs text-slate-600">詳細表示</div>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-[var(--navy)]">{title}</h3>
          {description ? <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const active = tab.id === activeTab.id;

            return (
              <button
                key={tab.id}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  active
                    ? "bg-[var(--navy)] text-white"
                    : "bg-white text-slate-800 ring-1 ring-black/5 hover:bg-[var(--accent-soft)] hover:text-[var(--navy)]",
                )}
                onClick={() => setActiveTabId(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab.note ? <div className="mt-3 text-xs text-slate-600">{activeTab.note}</div> : null}

      <div className="mt-4">{activeTab.content}</div>
    </section>
  );
}
