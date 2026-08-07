import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ScoreTrendChart } from "@/components/DashboardCharts";
import { StatusBadge } from "@/components/StatusBadge";
import { getJobsByWorker, getWorker, workers } from "@/data/mock";
import { formatDuration } from "@/lib/status";

export function generateStaticParams() {
  return workers.map((w) => ({ id: w.id }));
}

export default async function WorkerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const worker = getWorker(id);
  if (!worker) notFound();
  const workerJobs = [...getJobsByWorker(id)].sort((a, b) =>
    b.workDate.localeCompare(a.workDate),
  );

  return (
    <AppShell
      title={worker.name}
      subtitle={`${worker.id} · ${worker.skill}`}
      actions={
        <Link
          href="/workers/"
          className="rounded-lg border border-line px-3 py-2 text-sm"
        >
          목록
        </Link>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-line bg-surface p-5">
          <h2 className="text-sm font-semibold">기본 정보</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row k="국적" v={worker.nationality} />
            <Row k="나이" v={String(worker.age)} />
            <Row k="직종" v={worker.skill} />
            <Row k="에이전시" v={worker.agency} />
            <Row k="회사" v={worker.company} />
            <Row k="등록일" v={worker.registeredAt} />
            <div className="flex justify-between gap-4">
              <dt className="text-muted">분석상태</dt>
              <dd>
                <StatusBadge status={worker.analysisStatus} />
              </dd>
            </div>
            <Row
              k="최근 숙련도"
              v={
                worker.latestScore != null
                  ? `${worker.latestScore} · ${worker.latestLevel}`
                  : "미분석"
              }
            />
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/workers/compare/?trade=${encodeURIComponent(worker.skill)}`}
              className="text-xs text-brand hover:underline"
            >
              같은 직종 비교
            </Link>
            <Link
              href="/workers/trades/"
              className="text-xs text-brand hover:underline"
            >
              직종 현황
            </Link>
          </div>
        </section>

        <section className="rounded-xl border border-line bg-surface p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold">숙련도 추이</h2>
          {worker.scoreHistory.length ? (
            <ScoreTrendChart data={worker.scoreHistory} />
          ) : (
            <p className="py-10 text-center text-sm text-muted">이력 없음</p>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-4 text-sm font-semibold">분석 이력</h2>
        <div className="overflow-hidden rounded-lg border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg text-xs text-muted">
              <tr>
                <th className="px-3 py-2">날짜</th>
                <th className="px-3 py-2">영상</th>
                <th className="px-3 py-2">점수</th>
                <th className="px-3 py-2">상태</th>
                <th className="px-3 py-2">길이</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {workerJobs.map((j) => (
                <tr key={j.id} className="border-t border-line">
                  <td className="px-3 py-2 text-muted">{j.workDate}</td>
                  <td className="px-3 py-2 font-mono text-xs">{j.videoId}</td>
                  <td className="px-3 py-2 font-semibold text-brand">
                    {j.skillScore ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={j.status} />
                  </td>
                  <td className="px-3 py-2 text-muted">
                    {formatDuration(j.durationSec)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {j.status === "completed" ? (
                      <Link
                        href={`/analysis/${j.videoId}/`}
                        className="text-xs text-brand hover:underline"
                      >
                        결과
                      </Link>
                    ) : j.status === "failed" ? (
                      <Link
                        href="/work/failed/"
                        className="text-xs text-danger hover:underline"
                      >
                        실패
                      </Link>
                    ) : (
                      <Link
                        href="/work/progress/"
                        className="text-xs text-muted hover:underline"
                      >
                        진행
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </div>
  );
}
