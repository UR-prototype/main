import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import {
  getAnalysis,
  getJob,
  getWorker,
  jobs,
} from "@/data/mock";

export function generateStaticParams() {
  return jobs.map((j) => ({ id: j.videoId }));
}

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const analysis = getAnalysis(id);
  const job = getJob(id);
  const worker = analysis ? getWorker(analysis.workerId) : job ? getWorker(job.workerId) : null;

  if (!analysis && !job) notFound();

  return (
    <AppShell
      title="분석 결과"
      subtitle={`${id}${worker ? ` · ${worker.name}` : ""}`}
      actions={
        <div className="flex gap-2">
          {worker ? (
            <Link
              href={`/workers/${worker.id}/`}
              className="rounded-lg border border-line px-3 py-2 text-sm"
            >
              기술자
            </Link>
          ) : null}
          <Link
            href="/work/"
            className="rounded-lg border border-line px-3 py-2 text-sm"
          >
            작업·분석
          </Link>
        </div>
      }
    >
      {!analysis ? (
        <div className="rounded-xl border border-dashed border-line bg-surface p-10 text-center text-sm text-muted">
          아직 분석 결과가 없습니다. 상태는{" "}
          <Link href="/work/progress/" className="text-brand hover:underline">
            진행·검토
          </Link>{" "}
          탭에서 확인하세요.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <section className="rounded-xl border border-line bg-surface p-5 lg:col-span-1">
            <p className="text-xs text-muted">숙련도 점수</p>
            <p className="mt-1 text-4xl font-semibold text-brand">
              {analysis.skillScore}
            </p>
            <p className="mt-1 text-sm text-muted">{analysis.skillLevel}</p>
            <p className="mt-4 text-xs text-muted">
              신뢰도 {analysis.confidence.aiConfidence}% · 검토{" "}
              {analysis.reviewStatus}
            </p>
            {analysis.matching ? (
              <div className="mt-4 rounded-lg bg-brand-soft p-3 text-sm text-brand">
                <p className="font-medium">{analysis.matching.recommendedJob}</p>
                <p className="mt-1 text-xs opacity-90">{analysis.matching.reason}</p>
              </div>
            ) : null}
          </section>

          <section className="rounded-xl border border-line bg-surface p-5 lg:col-span-2">
            <h2 className="text-sm font-semibold">지표</h2>
            <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(
                [
                  ["속도", analysis.metrics.speed],
                  ["안정성", analysis.metrics.stability],
                  ["반복성", analysis.metrics.repetition],
                  ["정확도", analysis.metrics.accuracy],
                ] as const
              ).map(([label, value]) => (
                <li key={label} className="rounded-lg bg-bg px-3 py-3 text-center">
                  <p className="text-xs text-muted">{label}</p>
                  <p className="mt-1 text-lg font-semibold">{value}</p>
                </li>
              ))}
            </ul>
            {analysis.summary ? (
              <p className="mt-5 text-sm text-muted">{analysis.summary}</p>
            ) : null}
            {analysis.improvements?.length ? (
              <ul className="mt-3 list-inside list-disc text-sm text-muted">
                {analysis.improvements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        </div>
      )}
    </AppShell>
  );
}
