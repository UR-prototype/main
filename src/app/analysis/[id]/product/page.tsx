import Link from "next/link";
import { notFound } from "next/navigation";
import { AnalysisTabs } from "@/components/AnalysisTabs";
import { AppShell } from "@/components/AppShell";
import { ProductJudgmentPanel } from "@/components/ProductJudgmentPanel";
import { getAnalysis, getJob, getWorker, jobs } from "@/data/mock";

export function generateStaticParams() {
  return jobs.map((j) => ({ id: j.videoId }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = getJob(id);
  if (!job) notFound();
  const analysis = getAnalysis(id);
  const worker = getWorker(job.workerId);

  return (
    <AppShell
      title="결과물 판정"
      subtitle={`${worker?.name ?? job.workerId} · 기준 샘플 대비`}
      actions={
        <Link
          href={`/analysis/${id}/review/`}
          className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white"
        >
          검토로
        </Link>
      }
    >
      <AnalysisTabs videoId={id} />
      {!analysis ? (
        <div className="rounded-xl border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">
          결과물 데이터가 없습니다.
        </div>
      ) : (
        <ProductJudgmentPanel judgment={analysis.productJudgment} />
      )}
    </AppShell>
  );
}
