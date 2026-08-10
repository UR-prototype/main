import Link from "next/link";
import { AlertOctagon, ArrowRight } from "lucide-react";
import {
  AiManualCompareChart,
  LevelBarChart,
} from "@/components/DashboardCharts";
import { AppShell } from "@/components/AppShell";
import {
  assessmentSessions,
  dashboardStats,
  getSessionPrimaryVideoId,
  getWorker,
  mediaCounts,
  opsSummary,
  sessionNeedsNcsReview,
  sessionPipelineLabel,
  workers,
} from "@/data/mock";

export default function DashboardPage() {
  const pendingReview = assessmentSessions.filter(sessionNeedsNcsReview).length;
  const inPipeline = assessmentSessions.filter(
    (s) => sessionPipelineLabel(s) === "in_pipeline",
  ).length;
  const failed = assessmentSessions.filter(
    (s) => sessionPipelineLabel(s) === "failed",
  ).length;
  const recent = [...assessmentSessions]
    .sort((a, b) => b.examDate.localeCompare(a.examDate))
    .slice(0, 6);
  const attention = [
    ...assessmentSessions.filter((s) => sessionPipelineLabel(s) === "failed"),
    ...assessmentSessions.filter(
      (s) => sessionPipelineLabel(s) === "in_pipeline",
    ),
  ].slice(0, 5);

  const metrics = [
    {
      label: "세션",
      value: assessmentSessions.length,
      href: "/work/",
    },
    { label: "진행 중", value: inPipeline, href: "/work/progress/" },
    { label: "NCS 대기", value: pendingReview, href: "/evaluation/" },
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
      subtitle="평가 세션 기준 · 등록 → 라벨링 → NCS"
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
            <h2 className="text-xs font-semibold">최근 평가 세션</h2>
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
                  <th className="px-3 py-2 font-medium">등록번호</th>
                  <th className="px-3 py-2 font-medium">기술자</th>
                  <th className="px-3 py-2 font-medium">기술</th>
                  <th className="px-3 py-2 font-medium">일자</th>
                  <th className="px-3 py-2 font-medium">미디어</th>
                  <th className="px-3 py-2 font-medium">결과</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((s) => {
                  const w = getWorker(s.workerId);
                  const c = mediaCounts(s);
                  return (
                    <tr key={s.id} className="border-t border-line">
                      <td className="px-3 py-2 font-mono text-[11px] text-brand">
                        <Link
                          href={`/evaluation/${s.id}/`}
                          className="hover:underline"
                        >
                          {s.regNo}
                        </Link>
                      </td>
                      <td className="px-3 py-2">
                        <Link
                          href={`/workers/${s.workerId}/`}
                          className="font-medium hover:text-brand"
                        >
                          {w?.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-muted">{s.skill}</td>
                      <td className="px-3 py-2 text-muted">{s.examDate}</td>
                      <td className="px-3 py-2 text-muted">
                        영상 {c.videos} · 사진 {c.products}
                      </td>
                      <td className="px-3 py-2">
                        {s.status === "completed" ? (
                          <Link
                            href={`/evaluation/${s.id}/`}
                            className="font-medium text-brand hover:underline"
                          >
                            {s.skillScore != null ? `${s.skillScore}` : "평가"}
                          </Link>
                        ) : s.status === "failed" ? (
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
            <h2 className="text-xs font-semibold">우선 처리 (세션)</h2>
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
              {attention.map((s) => {
                const w = getWorker(s.workerId);
                const pipe = sessionPipelineLabel(s);
                return (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-2 py-2 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-mono text-[10px] text-brand">
                        {s.regNo}
                      </p>
                      <p className="truncate text-xs font-medium">
                        {w?.name} · {s.skill}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-[10px] text-muted">
                        {pipe === "failed"
                          ? "실패"
                          : pipe === "in_pipeline"
                            ? "진행"
                            : s.status}
                      </span>
                      <Link
                        href={
                          pipe === "failed"
                            ? "/work/failed/"
                            : `/evaluation/${s.id}/`
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
              실패 세션 {failed}건 재실행 필요
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
