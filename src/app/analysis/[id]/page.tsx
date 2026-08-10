import Link from "next/link";
import { notFound } from "next/navigation";
import { AnalysisTabs } from "@/components/AnalysisTabs";
import { AppShell } from "@/components/AppShell";
import { EvidenceChain } from "@/components/EvidenceChain";
import { EvidenceGallery } from "@/components/EvidenceGallery";
import { ExplainCard } from "@/components/ExplainCard";
import { FrameRail } from "@/components/FrameRail";
import { MatchingCard } from "@/components/MatchingCard";
import { PipelineProgress } from "@/components/PipelineProgress";
import { ProductJudgmentPanel } from "@/components/ProductJudgmentPanel";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import { StatusBadge } from "@/components/StatusBadge";
import { StudioMetaBar } from "@/components/StudioMetaBar";
import { TimelineScrubber } from "@/components/TimelineScrubber";
import { getAnalysis, getJob, getWorker, jobs } from "@/data/mock";
import { NCS_MOLD_ASSY, SCENARIO_MOLD, stageMeta } from "@/data/ncs";

export function generateStaticParams() {
  return jobs.map((j) => ({ id: j.videoId }));
}

function reviewStage(status: string | undefined) {
  if (status === "승인") return "최종 확정";
  if (status === "검토중" || status === "미검토") return "검수";
  if (status === "반려") return "재작업";
  return "분석";
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
  const stage =
    job.status === "completed"
      ? reviewStage(analysis?.reviewStatus)
      : "분석 파이프라인";

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

      <StudioMetaBar
        stage={stage}
        pipelineStatus={job.status}
        reviewStatus={analysis?.reviewStatus}
        assignee={job.assignee}
        fps={job.fps}
        frames={analysis?.framesExtracted}
      />

      {analysis?.ncsStages?.length ? (
        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-line bg-surface px-3 py-2 text-[11px]">
          <span className="font-medium text-ink">
            {analysis.scenarioId ?? SCENARIO_MOLD.id}
          </span>
          <span className="text-muted">
            {(analysis.ncsUnits ?? [NCS_MOLD_ASSY.code]).join(" · ")}
          </span>
          <span className="hidden h-3 w-px bg-line sm:block" />
          {analysis.ncsStages.map((s) => {
            const m = stageMeta(s.stageId);
            return (
              <span key={s.id} className="inline-flex items-center gap-1">
                <i
                  className="inline-block h-2 w-2 rounded-sm"
                  style={{ background: m.color }}
                />
                {m.element} {m.name}
              </span>
            );
          })}
        </div>
      ) : null}

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
          <EvidenceChain result={analysis} videoId={id} />

          <div className="grid gap-5 xl:grid-cols-5">
            <div className="space-y-5 xl:col-span-3">
              <TimelineScrubber result={analysis} />
              <FrameRail
                frames={analysis.evidenceFrames}
                title="근거 프레임 스트립"
              />
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
