"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SectionTab = { href: string; label: string; match?: (path: string) => boolean };

function normalize(path: string) {
  if (!path) return "/";
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

export function SectionTabs({ tabs }: { tabs: SectionTab[] }) {
  const pathname = normalize(usePathname());

  return (
    <div className="mb-5 border-b border-line">
      <nav className="-mb-px flex flex-wrap gap-1" aria-label="섹션 탭">
        {tabs.map((tab) => {
          const target = normalize(tab.href);
          const active = tab.match
            ? tab.match(pathname)
            : pathname === target || pathname.startsWith(`${target}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`border-b-2 px-3 py-2 text-sm transition ${
                active
                  ? "border-brand font-medium text-brand"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export const workTabs: SectionTab[] = [
  {
    href: "/work/",
    label: "전체 세션",
    match: (p) => p === "/work",
  },
  {
    href: "/work/progress/",
    label: "진행·NCS 검토",
    match: (p) => p === "/work/progress",
  },
  {
    href: "/work/failed/",
    label: "실패",
    match: (p) => p === "/work/failed",
  },
];

export const registerTabs: SectionTab[] = [
  {
    href: "/register/",
    label: "평가 세션",
    match: (p) => p === "/register",
  },
  {
    href: "/register/product/",
    label: "세션에 사진 추가",
    match: (p) => p === "/register/product",
  },
];

export const labelingTabs: SectionTab[] = [
  {
    href: "/labeling/library/",
    label: "미디어 목록",
    match: (p) => p === "/labeling/library",
  },
  {
    href: "/labeling/",
    label: "타임라인",
    match: (p) => p === "/labeling",
  },
  {
    href: "/labeling/product/",
    label: "조형물 좌표",
    match: (p) => p === "/labeling/product",
  },
];

export const workerTabs: SectionTab[] = [
  {
    href: "/workers/",
    label: "목록",
    match: (p) => p === "/workers",
  },
  {
    href: "/workers/compare/",
    label: "비교",
    match: (p) => p === "/workers/compare" || p === "/workers/trades",
  },
];
