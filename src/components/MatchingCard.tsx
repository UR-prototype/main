import type { MatchingRecommendation } from "@/data/mock";

export function MatchingCard({ matching }: { matching: MatchingRecommendation }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted">현장 매칭</p>
          <h2 className="mt-1 text-base font-semibold text-ink">
            {matching.recommendedJob}
          </h2>
        </div>
        <span
          className={`rounded-md px-2 py-1 text-xs font-medium ${
            matching.eligible
              ? "bg-emerald-50 text-ok"
              : "bg-amber-50 text-amber-800"
          }`}
        >
          {matching.eligible ? "가능" : "교육 후"}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted">{matching.reason}</p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {matching.recommendedSites.map((site) => (
          <li
            key={site}
            className="rounded-md border border-line bg-bg px-2.5 py-1 text-xs text-muted"
          >
            {site}
          </li>
        ))}
      </ul>
    </section>
  );
}
