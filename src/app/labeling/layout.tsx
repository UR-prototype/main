"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { SectionTabs, labelingTabs } from "@/components/SectionTabs";

function normalize(path: string) {
  if (!path) return "/";
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

export default function LabelingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = normalize(usePathname());
  const studio = path === "/labeling" || path === "/labeling/product";

  if (studio) {
    return (
      <AppShell
        variant="studio"
        title="라벨링 스튜디오"
        actions={
          <nav className="flex items-center gap-1 text-xs">
            {labelingTabs.map((tab) => {
              const target = normalize(tab.href);
              const active = tab.match
                ? tab.match(path)
                : path === target;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`rounded px-2.5 py-1 font-medium transition ${
                    active
                      ? "bg-brand text-white"
                      : "text-muted hover:bg-bg hover:text-ink"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        }
      >
        {children}
      </AppShell>
    );
  }

  return (
    <AppShell
      title="라벨링"
      subtitle="미디어 목록 · 타임라인 Stage/Event · 조형물 좌표"
    >
      <SectionTabs tabs={labelingTabs} />
      {children}
    </AppShell>
  );
}
