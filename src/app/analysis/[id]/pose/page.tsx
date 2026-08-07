import Link from "next/link";
import { notFound } from "next/navigation";
import { AnalysisTabs } from "@/components/AnalysisTabs";
import { AppShell } from "@/components/AppShell";
import { PoseTracker } from "@/components/PoseTracker";
import { getAnalysis, getJob, getWorker, jobs } from "@/data/mock";

export function generateStaticParams() {
  return jobs.map((j) => ({ id: j.videoId }));
}

export default async function PosePage({
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
      title="자세 분석"
      subtitle={`${worker?.name ?? job.workerId} · MediaPipe 관절 추적 근거`}
      actions={
        <Link
          href={`/reports/${id}/`}
          className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white"
        >
          평가서
        </Link>
      }
    >
      <AnalysisTabs videoId={id} />
      {!analysis ? (
        <div className="rounded-xl border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">
          자세 분석 데이터가 없습니다.
        </div>
      ) : (
        <section className="rounded-xl border border-line bg-surface p-5">
          <h2 className="mb-4 text-sm font-semibold">관절 추적</h2>
          <PoseTracker videoId={id} videoName={job.videoName} />
        </section>
      )}
    </AppShell>
  );
}
