import type { AnalysisResult } from "@/data/mock";

export function ExplainCard({ result }: { result: AnalysisResult }) {
  const strengths = [
    result.metrics.repetition >= 75 ? "반복 작업 안정" : null,
    result.metrics.accuracy >= 75 ? "정확도 양호" : null,
    result.metrics.stability >= 75 ? "자세·동선 안정" : null,
    result.productJudgment.overall === "합격" ? "결과물 품질 합격" : null,
  ].filter(Boolean) as string[];

  return (
    <section className="rounded-xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted">AI 요약</p>
          <p className="mt-1 text-sm text-muted">
            {result.matching.recommendedJob}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold tabular-nums text-brand">
            {result.skillScore}
          </p>
          <p className="text-sm text-muted">{result.skillLevel}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 border-t border-line pt-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium text-muted">강점</p>
          <ul className="mt-1.5 space-y-1 text-sm">
            {(strengths.length ? strengths : ["기본 작업 수행 가능"]).map(
              (s) => (
                <li key={s}>{s}</li>
              ),
            )}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium text-muted">개선</p>
          <ul className="mt-1.5 space-y-1 text-sm text-muted">
            {result.improvements.slice(0, 3).map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium text-muted">결과물 · 신뢰도</p>
          <p className="mt-1.5 text-sm">
            {result.productJudgment.overall} ·{" "}
            {result.confidence.aiConfidence}%
          </p>
          <p className="mt-1 text-xs text-muted">{result.matching.reason}</p>
        </div>
      </div>
    </section>
  );
}
