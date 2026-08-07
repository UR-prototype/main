"use client";

import Link from "next/link";
import { AlertOctagon, ArrowRight, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { UploadButton } from "@/components/UploadButton";
import {
  analyses,
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
    .slice(0, 6);
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
  const sampleDone = jobs.find((j) => j.videoId === "V-101" && j.status === "completed");

  return (
    <AppShell
      title="대시보드"
      subtitle="오늘 처리할 분석·검토와 운영 지표"
      actions={
        <div className="flex gap-2">
          <Link
            href="/workers/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm"
          >
            <Users size={14} />
            기술자
          </Link>
          <UploadButton />
        </div>
      }
    >
      {sampleDone ? (
        <section className="mb-5 rounded-xl border border-brand/20 bg-brand-soft/50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-brand">샘플 완료 건</p>
              <p className="mt-0.5 text-sm font-semibold text-ink">
                DO TIEN DUC · V-101 · 78점 (중급)
              </p>
              <p className="mt-0.5 text-xs text-muted">
                분석 종합 → 자세 → 검토 → 평가서 순으로 확인할 수 있습니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/analysis/V-101/"
                className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white"
              >
                분석 열기
              </Link>
              <Link
                href="/reports/V-101/"
                className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs"
              >
                평가서
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="오늘 분석 완료" value={opsSummary.todayCompleted} href="/work/" />
        <Kpi
          label="파이프라인 진행"
          value={inPipeline}
          href="/work/progress/"
          hint="대기·전처리·분석 중"
        />
        <Kpi
          label="검토 대기"
          value={pendingReview}
          href="/work/progress/"
          hint="완료·미승인"
        />
        <Kpi
          label="분석 실패"
          value={failed}
          href="/work/failed/"
          tone={failed > 0 ? "danger" : "default"}
        />
      </section>

      <section className="mt-3 grid gap-3 sm:grid-cols-3">
        <Kpi label="평균 숙련도" value={opsSummary.avgScore} href="/workers/compare/" />
        <Kpi
          label="주의 인력"
          value={opsSummary.highRiskWorkers}
          href="/workers/"
          tone={opsSummary.highRiskWorkers > 0 ? "warn" : "default"}
        />
        <Kpi label="등록 기술자" value={workers.length} href="/workers/" />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="rounded-xl border border-line bg-surface p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">우선 처리</h2>
            <Link href="/work/failed/" className="text-xs text-brand hover:underline">
              실패 탭
            </Link>
          </div>
          {attention.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              대기 중인 이슈가 없습니다.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {attention.map((j) => {
                const w = getWorker(j.workerId);
                return (
                  <li
                    key={j.id}
                    className="flex items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {w?.name ?? j.workerId}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {j.videoId} · {j.jobType}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={j.status} />
                      <Link
                        href={
                          j.status === "failed"
                            ? "/work/failed/"
                            : j.status === "completed"
                              ? `/analysis/${j.videoId}/`
                              : "/work/progress/"
                        }
                        className="text-xs text-brand hover:underline"
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
            <p className="mt-3 flex items-start gap-2 rounded-md bg-red-50 px-3 py-2 text-xs text-danger">
              <AlertOctagon size={14} className="mt-0.5 shrink-0" />
              실패 {failed}건은 작업·분석 → 실패 탭에서 재실행·담당 배정합니다.
            </p>
          ) : null}
        </section>

        <section className="rounded-xl border border-line bg-surface p-5 lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">최근 작업 영상</h2>
            <Link
              href="/work/"
              className="inline-flex items-center gap-1 text-xs text-brand hover:underline"
            >
              전체
              <ArrowRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-muted">
                <tr>
                  <th className="pb-2 font-medium">기술자</th>
                  <th className="pb-2 font-medium">영상</th>
                  <th className="pb-2 font-medium">상태</th>
                  <th className="pb-2 font-medium">길이</th>
                  <th className="pb-2 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recent.map((j) => {
                  const w = getWorker(j.workerId);
                  const score = j.skillScore ?? analyses[j.videoId]?.skillScore;
                  return (
                    <tr key={j.id}>
                      <td className="py-2.5">
                        <Link
                          href={`/workers/${j.workerId}/`}
                          className="font-medium hover:text-brand"
                        >
                          {w?.name}
                        </Link>
                        <p className="text-[11px] text-muted">{j.jobType}</p>
                      </td>
                      <td className="py-2.5 font-mono text-xs text-muted">
                        {j.videoId}
                      </td>
                      <td className="py-2.5">
                        <StatusBadge status={j.status} />
                      </td>
                      <td className="py-2.5 text-xs text-muted">
                        {formatDuration(j.durationSec)}
                      </td>
                      <td className="py-2.5 text-right">
                        {j.status === "completed" ? (
                          <Link
                            href={`/analysis/${j.videoId}/`}
                            className="text-xs text-brand hover:underline"
                          >
                            {score != null ? `${score}점` : "결과"}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Kpi({
  label,
  value,
  href,
  hint,
  tone = "default",
}: {
  label: string;
  value: number;
  href: string;
  hint?: string;
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
      className="rounded-xl border border-line bg-surface p-4 transition hover:border-brand/40 hover:bg-brand-soft/40"
    >
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${valueClass}`}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-[11px] text-muted">{hint}</p> : null}
    </Link>
  );
}
