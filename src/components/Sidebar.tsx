"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardCheck,
  Clapperboard,
  FolderInput,
  LayoutDashboard,
  LogOut,
  Tags,
  Users,
} from "lucide-react";

function normalize(path: string) {
  if (!path) return "/";
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

const nav = [
  {
    href: "/",
    label: "대시보드",
    icon: LayoutDashboard,
    match: (p: string) => p === "/",
  },
  {
    href: "/register/",
    label: "등록",
    icon: FolderInput,
    match: (p: string) => p === "/register" || p.startsWith("/register/"),
  },
  {
    href: "/labeling/library/",
    label: "라벨링",
    icon: Tags,
    match: (p: string) => p === "/labeling" || p.startsWith("/labeling/"),
  },
  {
    href: "/evaluation/",
    label: "숙련도 평가",
    icon: ClipboardCheck,
    match: (p: string) => p === "/evaluation" || p.startsWith("/evaluation/"),
  },
  {
    href: "/work/",
    label: "작업 현황",
    icon: Clapperboard,
    match: (p: string) => p === "/work" || p.startsWith("/work/"),
  },
  {
    href: "/workers/",
    label: "기술자",
    icon: Users,
    match: (p: string) => p === "/workers" || p.startsWith("/workers/"),
  },
];

export function Sidebar() {
  const pathname = normalize(usePathname());

  return (
    <aside className="flex h-full w-52 shrink-0 flex-col border-r border-line bg-surface">
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-line px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-xs font-bold text-white">
          UR
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">UR Connection</p>
          <p className="truncate text-[10px] text-muted">Console v0.2</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-3">
        {nav.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition ${
                active
                  ? "bg-brand-soft font-medium text-brand"
                  : "text-ink hover:bg-bg"
              }`}
            >
              <Icon size={15} className="shrink-0 opacity-80" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-line p-2.5">
        <Link
          href="/login/"
          className="flex w-full items-center justify-center gap-2 rounded-md border border-line px-3 py-2 text-sm text-muted hover:bg-bg hover:text-ink"
        >
          <LogOut size={15} />
          로그아웃
        </Link>
      </div>
    </aside>
  );
}
