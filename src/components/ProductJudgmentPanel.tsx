import type { ProductJudgment } from "@/data/mock";
import { asset } from "@/lib/asset";

const verdictStyle = {
  pass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warn: "bg-amber-50 text-amber-800 border-amber-200",
  fail: "bg-red-50 text-red-700 border-red-200",
} as const;

const verdictLabel = {
  pass: "합격",
  warn: "주의",
  fail: "불합격",
} as const;

const overallStyle = {
  합격: "bg-emerald-50 text-emerald-800 border-emerald-200",
  조건부합격: "bg-amber-50 text-amber-900 border-amber-200",
  불합격: "bg-red-50 text-red-800 border-red-200",
} as const;

export function ProductJudgmentPanel({
  judgment,
}: {
  judgment: ProductJudgment;
}) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-sm font-semibold">결과물 판정</h2>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${overallStyle[judgment.overall]}`}
          >
            {judgment.overall}
          </span>
          <span className="rounded-lg bg-brand-soft px-3 py-1.5 text-sm font-semibold text-brand">
            {judgment.score}점
          </span>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <figure className="overflow-hidden rounded-xl border border-line bg-bg">
          <div className="aspect-square">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset(judgment.referenceSrc)}
              alt="기준 샘플"
              className="h-full w-full object-cover"
            />
          </div>
          <figcaption className="border-t border-line px-3 py-2 text-xs font-medium">
            기준 샘플 (Master)
          </figcaption>
        </figure>
        <figure className="overflow-hidden rounded-xl border border-line bg-bg">
          <div className="aspect-square">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset(judgment.candidateSrc)}
              alt="작업자 결과물"
              className="h-full w-full object-cover"
            />
          </div>
          <figcaption className="border-t border-line px-3 py-2 text-xs font-medium">
            작업자 결과물
          </figcaption>
        </figure>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-muted">{judgment.summary}</p>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {judgment.checklist.map((item) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-xl border border-line bg-bg"
          >
            <div className="relative aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset(item.src)}
                alt={item.title}
                className="h-full w-full object-cover"
              />
              <span
                className={`absolute left-2 top-2 rounded border px-1.5 py-0.5 text-[10px] font-semibold ${verdictStyle[item.verdict]}`}
              >
                {verdictLabel[item.verdict]}
              </span>
              {item.scoreImpact !== 0 ? (
                <span className="absolute right-2 top-2 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {item.scoreImpact}
                </span>
              ) : null}
            </div>
            <div className="space-y-1 p-3">
              <h3 className="text-sm font-semibold">{item.title}</h3>
              <p className="text-[11px] text-muted">기준: {item.criteria}</p>
              <p className="text-xs leading-relaxed">{item.finding}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
