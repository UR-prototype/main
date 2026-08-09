import Link from "next/link";
import { AlertOctagon, ArrowRight } from "lucide-react";
import {
  AiManualCompareChart,
  LevelBarChart,
} from "@/components/DashboardCharts";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import {
  analyses,
  dashboardStats,
  getWorker,
  jobs,
  opsSummary,
  workers,
} from "@/data/mock";
import { formatDuration } from "@/lib/status";

function reviewPendingCount() {
  return jobs.filter((j) => {
    if (j.status !== "completed") return false;
    const a = analyses[j.videoId];
    return !a || a.reviewStatus === "미검토" || a.reviewStatus === "검토중";
  }).length;
}

export default function DashboardPage() {
  const pendingReview = reviewPendingCount();
  const inPipeline = opsSummary.inPipeline;
  const failed = opsSummary.failedJobs;
  const recent = [...jobs]
    .sort((a, b) => b.workDate.localeCompare(a.workDate))
    .slice(0, 8);
  const attention = [
    ...jobs.filter((j) => j.status === "failed"),
    ...jobs.filter((j) =>
      [
        "queued",
        "preprocessing",
        "pose_extraction",
        "analyzing",
        "scoring",
      ].includes(j.status),
    ),
  ].slice(0, 5);

  const metrics = [
    { label: "오늘 완료", value: opsSummary.todayCompleted, href: "/work/" },
    { label: "진행 중", value: inPipeline, href: "/work/progress/" },
    { label: "검토 대기", value: pendingReview, href: "/evaluation/" },
    {
      label: "실패",
      value: failed,
      href: "/work/failed/",
      tone: failed > 0 ? ("danger" as const) : ("default" as const),
    },
    { label: "평균", value: opsSummary.avgScore, href: "/workers/compare/" },
    {
      label: "주의",
      value: opsSummary.highRiskWorkers,
      href: "/workers/",
      tone:
        opsSummary.highRiskWorkers > 0
          ? ("warn" as const)
          : ("default" as const),
    },
    { label: "기술자", value: workers.length, href: "/workers/" },
  ];

  return (
    <AppShell
      title="대시보드"
      subtitle="등록 → 라벨링 → NCS 평가"
      actions={
        <div className="flex gap-1.5">
          <Link
            href="/register/"
            className="rounded-md border border-line px-2.5 py-1 text-xs"
          >
            등록
          </Link>
          <Link
            href="/labeling/"
            className="rounded-md border border-line px-2.5 py-1 text-xs"
          >
            라벨링
          </Link>
          <Link
            href="/evaluation/"
            className="rounded-md bg-brand px-2.5 py-1 text-xs font-medium text-white"
          >
            숙련도 평가
          </Link>
        </div>
      }
    >
      <div className="mb-3 flex flex-wrap items-center divide-x divide-line border-b border-line pb-2 text-xs">
        {metrics.map((m) => (
          <Link
            key={m.label}
            href={m.href}
            className="group inline-flex items-baseline gap-1.5 px-2.5 py-0.5 first:pl-0"
          >
            <span className="text-muted group-hover:text-ink">{m.label}</span>
            <span
              className={`font-semibold tabular-nums ${
                m.tone === "danger"
                  ? "text-danger"
                  : m.tone === "warn"
                    ? "text-warn"
                    : "text-ink"
              }`}
            >
              {m.value}
            </span>
          </Link>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-12">
        <section className="overflow-hidden rounded-lg border border-line bg-surface lg:col-span-8">
          <div className="flex items-center justify-between border-b border-line px-3 py-2">
            <h2 className="text-xs font-semibold">최근 영상</h2>
            <Link
              href="/work/"
              className="inline-flex items-center gap-0.5 text-[11px] text-brand hover:underline"
            >
              전체
              <ArrowRight size={11} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-xs">
              <thead className="bg-bg text-[10px] text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">기술자</th>
                  <th className="px-3 py-2 font-medium">직종</th>
                  <th className="px-3 py-2 font-medium">영상</th>
                  <th className="px-3 py-2 font-medium">길이</th>
                  <th className="px-3 py-2 font-medium">상태</th>
                  <th className="px-3 py-2 font-medium">결과</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((j) => {
                  const w = getWorker(j.workerId);
                  const score = j.skillScore ?? analyses[j.videoId]?.skillScore;
                  return (
                    <tr key={j.id} className="border-t border-line">
                      <td className="px-3 py-2">
                        <Link
                          href={`/workers/${j.workerId}/`}
                          className="font-medium hover:text-brand"
                        >
                          {w?.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-muted">{j.jobType}</td>
                      <td className="px-3 py-2 font-mono text-[11px] text-muted">
                        {j.videoId}
                      </td>
                      <td className="px-3 py-2 tabular-nums text-muted">
                        {formatDuration(j.durationSec)}
                      </td>
                      <td className="px-3 py-2">
                        <StatusBadge status={j.status} />
                      </td>
                      <td className="px-3 py-2">
                        {j.status === "completed" ? (
                          <Link
                            href={`/analysis/${j.videoId}/`}
                            className="font-medium text-brand hover:underline"
                          >
                            {score != null ? `${score}` : "결과"}
                          </Link>
                        ) : j.status === "failed" ? (
                          <Link
                            href="/work/failed/"
                            className="text-danger hover:underline"
                          >
                            실패
                          </Link>
                        ) : (
                          <Link
                            href="/work/progress/"
                            className="text-muted hover:underline"
                          >
                            진행
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-lg border border-line bg-surface p-3 lg:col-span-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold">우선 처리</h2>
            <Link
              href="/work/failed/"
              className="text-[11px] text-brand hover:underline"
            >
              실패
            </Link>
          </div>
          {attention.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted">이슈 없음</p>
          ) : (
            <ul className="divide-y divide-line">
              {attention.map((j) => {
                const w = getWorker(j.workerId);
                return (
                  <li
                    key={j.id}
                    className="flex items-center justify-between gap-2 py-2 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">
                        {w?.name ?? j.workerId}
                      </p>
                      <p className="truncate text-[10px] text-muted">
                        {j.videoId} · {j.jobType}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <StatusBadge status={j.status} />
                      <Link
                        href={
                          j.status === "failed"
                            ? "/work/failed/"
                            : `/analysis/${j.videoId}/`
                        }
                        className="text-[10px] text-brand hover:underline"
                      >
                        이동
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {failed > 0 ? (
            <p className="mt-2 flex items-start gap-1 rounded bg-red-50 px-2 py-1.5 text-[10px] text-danger">
              <AlertOctagon size={11} className="mt-0.5 shrink-0" />
              실패 {failed}건 재실행 필요
            </p>
          ) : null}
        </section>

        <section className="rounded-lg border border-line bg-surface p-3 lg:col-span-6">
          <h2 className="mb-1 text-xs font-semibold">등급 분포</h2>
          <LevelBarChart data={dashboardStats.levelDist} compact />
        </section>
        <section className="rounded-lg border border-line bg-surface p-3 lg:col-span-6">
          <h2 className="mb-1 text-xs font-semibold">시스템 vs 평가자</h2>
          <AiManualCompareChart data={dashboardStats.scoreTrend} compact />
        </section>
      </div>
    </AppShell>
  );
}
