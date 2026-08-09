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
    .slice(0, 5);
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
  ].slice(0, 4);

  const kpis = [
    { label: "오늘 완료", value: opsSummary.todayCompleted, href: "/work/" },
    { label: "진행 중", value: inPipeline, href: "/work/progress/" },
    { label: "검토 대기", value: pendingReview, href: "/evaluation/" },
    {
      label: "실패",
      value: failed,
      href: "/work/failed/",
      tone: failed > 0 ? ("danger" as const) : ("default" as const),
    },
    { label: "평균 점수", value: opsSummary.avgScore, href: "/workers/compare/" },
    {
      label: "주의 인력",
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
      subtitle="등록 · 라벨링 · NCS 평가"
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
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-xs">
        <p className="text-muted">
          <span className="font-medium text-ink">흐름</span>
          {" · "}
          등록 → 라벨링 → NCS 평가
          <span className="mx-1.5 text-line">|</span>
          객체·포즈 외부 인수 · 숙련도는 NCS·전문가
        </p>
        <div className="flex gap-2">
          <Link href="/labeling/" className="text-brand hover:underline">
            타임라인
          </Link>
          <Link href="/evaluation/V-101/" className="text-brand hover:underline">
            NCS 예시
          </Link>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
        {kpis.map((k) => (
          <Kpi key={k.label} {...k} />
        ))}
      </section>

      <div className="mt-3 grid gap-3 lg:grid-cols-12">
        <section className="rounded-lg border border-line bg-surface p-3 lg:col-span-3">
          <h2 className="mb-1 text-xs font-semibold">등급 분포</h2>
          <LevelBarChart data={dashboardStats.levelDist} compact />
        </section>
        <section className="rounded-lg border border-line bg-surface p-3 lg:col-span-3">
          <h2 className="mb-1 text-xs font-semibold">시스템 vs 평가자</h2>
          <AiManualCompareChart data={dashboardStats.scoreTrend} compact />
        </section>

        <section className="rounded-lg border border-line bg-surface p-3 lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold">우선 처리</h2>
            <Link href="/work/failed/" className="text-[11px] text-brand hover:underline">
              실패
            </Link>
          </div>
          {attention.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted">이슈 없음</p>
          ) : (
            <ul className="space-y-2">
              {attention.map((j) => {
                const w = getWorker(j.workerId);
                return (
                  <li key={j.id} className="min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="truncate text-xs font-medium">
                        {w?.name ?? j.workerId}
                      </p>
                      <StatusBadge status={j.status} />
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-1">
                      <p className="truncate text-[10px] text-muted">
                        {j.videoId}
                      </p>
                      <Link
                        href={
                          j.status === "failed"
                            ? "/work/failed/"
                            : `/analysis/${j.videoId}/`
                        }
                        className="shrink-0 text-[10px] text-brand hover:underline"
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
            <p className="mt-2 flex items-start gap-1 rounded bg-red-50 px-1.5 py-1 text-[10px] text-danger">
              <AlertOctagon size={11} className="mt-0.5 shrink-0" />
              실패 {failed}건 재실행 필요
            </p>
          ) : null}
        </section>

        <section className="overflow-hidden rounded-lg border border-line bg-surface lg:col-span-4">
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
          <table className="w-full text-left text-xs">
            <thead className="bg-bg text-[10px] text-muted">
              <tr>
                <th className="px-2.5 py-1.5 font-medium">기술자</th>
                <th className="px-2.5 py-1.5 font-medium">영상</th>
                <th className="px-2.5 py-1.5 font-medium">상태</th>
                <th className="px-2.5 py-1.5 font-medium">결과</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((j) => {
                const w = getWorker(j.workerId);
                const score = j.skillScore ?? analyses[j.videoId]?.skillScore;
                return (
                  <tr key={j.id} className="border-t border-line">
                    <td className="px-2.5 py-1.5">
                      <Link
                        href={`/workers/${j.workerId}/`}
                        className="font-medium hover:text-brand"
                      >
                        {w?.name}
                      </Link>
                      <p className="text-[10px] text-muted">
                        {j.jobType} · {formatDuration(j.durationSec)}
                      </p>
                    </td>
                    <td className="px-2.5 py-1.5 font-mono text-[10px] text-muted">
                      {j.videoId}
                    </td>
                    <td className="px-2.5 py-1.5">
                      <StatusBadge status={j.status} />
                    </td>
                    <td className="px-2.5 py-1.5">
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
        </section>
      </div>
    </AppShell>
  );
}

function Kpi({
  label,
  value,
  href,
  tone = "default",
}: {
  label: string;
  value: number;
  href: string;
  tone?: "default" | "danger" | "warn";
}) {
  const valueClass =
    tone === "danger"
      ? "text-danger"
      : tone === "warn"
        ? "text-warn"
        : "text-ink";
  return (
    <Link
      href={href}
      className="rounded-lg border border-line bg-surface px-2.5 py-2 transition hover:border-brand/40 hover:bg-brand-soft/30"
    >
      <p className="truncate text-[10px] text-muted">{label}</p>
      <p className={`mt-0.5 text-lg font-semibold tabular-nums leading-none ${valueClass}`}>
        {value}
      </p>
    </Link>
  );
}
