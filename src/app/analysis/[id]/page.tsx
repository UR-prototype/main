import Link from "next/link";
import { notFound } from "next/navigation";
import { AnalysisTabs } from "@/components/AnalysisTabs";
import { AppShell } from "@/components/AppShell";
import { EvidenceGallery } from "@/components/EvidenceGallery";
import { ExplainCard } from "@/components/ExplainCard";
import { MatchingCard } from "@/components/MatchingCard";
import { PipelineProgress } from "@/components/PipelineProgress";
import { ProductJudgmentPanel } from "@/components/ProductJudgmentPanel";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import { StatusBadge } from "@/components/StatusBadge";
import { TimelineScrubber } from "@/components/TimelineScrubber";
import { getAnalysis, getJob, getWorker, jobs } from "@/data/mock";

export function generateStaticParams() {
  return jobs.map((j) => ({ id: j.videoId }));
}

export default async function AnalysisOverviewPage({
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
      title="분석 결과"
      subtitle={`${worker?.name ?? job.workerId} · ${job.videoId} · ${job.jobType}`}
      actions={
        <div className="flex gap-2">
          <Link
            href={`/workers/${job.workerId}/`}
            className="rounded-lg border border-line px-3 py-2 text-sm"
          >
            기술자
          </Link>
          <Link
            href={`/reports/${id}/`}
            className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white"
          >
            평가서
          </Link>
        </div>
      }
    >
      <AnalysisTabs videoId={id} />

      {job.status !== "completed" ? (
        <section className="mb-5 rounded-xl border border-line bg-surface p-4">
          <PipelineProgress
            status={job.status}
            progress={job.progress}
            variant="full"
          />
        </section>
      ) : null}

      {!analysis ? (
        <div className="rounded-xl border border-dashed border-line bg-surface p-10 text-center">
          <p className="font-medium">분석 결과가 아직 없습니다</p>
          <p className="mt-2 text-sm text-muted">
            현재 상태: <StatusBadge status={job.status} />
          </p>
          <Link
            href="/work/progress/"
            className="mt-4 inline-block text-sm text-brand hover:underline"
          >
            진행·검토 탭으로
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          <ExplainCard result={analysis} />

          <div className="grid gap-5 xl:grid-cols-5">
            <div className="xl:col-span-3">
              <TimelineScrubber result={analysis} />
            </div>
            <div className="space-y-5 xl:col-span-2">
              <section className="rounded-xl border border-line bg-surface p-5">
                <h2 className="mb-3 text-sm font-semibold">점수 구성</h2>
                <ScoreBreakdown result={analysis} />
              </section>
              <MatchingCard matching={analysis.matching} />
            </div>
          </div>

          <ProductJudgmentPanel judgment={analysis.productJudgment} />
          <EvidenceGallery frames={analysis.evidenceFrames} highlightOnly />
        </div>
      )}
    </AppShell>
  );
}
