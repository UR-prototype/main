"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { slug: "", label: "종합" },
  { slug: "pose", label: "자세" },
  { slug: "product", label: "결과물" },
  { slug: "review", label: "검토" },
];

function normalize(path: string) {
  if (!path) return "/";
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

export function AnalysisTabs({ videoId }: { videoId: string }) {
  const pathname = normalize(usePathname());
  const base = `/analysis/${videoId}`;

  return (
    <div className="mb-5 border-b border-line">
      <nav className="-mb-px flex flex-wrap gap-1" aria-label="분석 상세">
        {tabs.map((t) => {
          const href = t.slug ? `${base}/${t.slug}/` : `${base}/`;
          const target = normalize(href);
          const active = pathname === target;
          return (
            <Link
              key={t.label}
              href={href}
              className={`border-b-2 px-3 py-2 text-sm transition ${
                active
                  ? "border-brand font-medium text-brand"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
