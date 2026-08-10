"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import {
  assessmentSessions,
  getJobsBySession,
  getSessionPrimaryVideoId,
  getWorker,
  mediaCounts,
  sessionNeedsNcsReview,
  sessionPipelineLabel,
  type AssessmentSession,
} from "@/data/mock";

const sessionStatusKo = {
  draft: "작성중",
  in_progress: "진행중",
  completed: "완료",
  failed: "실패",
} as const;

export function WorkSessionsTable({
  mode,
}: {
  mode: "all" | "progress" | "failed";
}) {
  const [rows, setRows] = useState<AssessmentSession[]>(() =>
    assessmentSessions.map((s) => ({ ...s, media: [...s.media] })),
  );

  const filtered = useMemo(() => {
    const sorted = [...rows].sort((a, b) =>
      b.examDate.localeCompare(a.examDate),
    );
    if (mode === "failed") {
      return sorted.filter(
        (s) =>
          s.status === "failed" ||
          getJobsBySession(s.id).some((j) => j.status === "failed"),
      );
    }
    if (mode === "progress") {
      return sorted.filter((s) => {
        const pipe = sessionPipelineLabel(s);
        return pipe === "in_pipeline" || sessionNeedsNcsReview(s);
      });
    }
    return sorted;
  }, [mode, rows]);

  function retrySession(sessionId: string) {
    setRows((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, status: "in_progress", note: "재실행 요청됨" }
          : s,
      ),
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-surface p-10 text-center text-sm text-muted">
        {mode === "failed"
          ? "실패 세션이 없습니다."
          : mode === "progress"
            ? "진행·NCS 검토 대기 세션이 없습니다."
            : "등록된 평가 세션이 없습니다."}
      </div>
    );
  }

  if (mode === "failed") {
    return (
      <div className="space-y-3">
        {filtered.map((s) => {
          const w = getWorker(s.workerId);
          const c = mediaCounts(s);
          const failedJobs = getJobsBySession(s.id).filter(
            (j) => j.status === "failed",
          );
          return (
            <div
              key={s.id}
              className="rounded-xl border border-red-200 bg-surface p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-semibold text-brand">
                    {s.regNo}
                  </p>
                  <p className="font-semibold">
                    {w?.name} · {s.skill} · {s.examDate}
                  </p>
                  <p className="text-xs text-muted">
                    영상 {c.videos} · 사진 {c.products}
                  </p>
                  {failedJobs.map((j) => (
                    <p key={j.id} className="mt-1 text-sm text-danger">
                      [{j.errorCode}] {j.errorMessage} · {j.videoId}
                    </p>
                  ))}
                  {!failedJobs.length && s.note ? (
                    <p className="mt-1 text-sm text-danger">{s.note}</p>
                  ) : null}
                </div>
                <span className="rounded-md bg-red-50 px-2 py-0.5 text-xs text-danger">
                  실패
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => retrySession(s.id)}
                  className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white"
                >
                  세션 재실행
                </button>
                <Link
                  href={`/workers/${s.workerId}/`}
                  className="text-xs text-brand hover:underline"
                >
                  기술자
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line bg-bg text-xs text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">등록번호</th>
            <th className="px-4 py-3 font-medium">기술자 · 기술</th>
            <th className="px-4 py-3 font-medium">일자</th>
            <th className="px-4 py-3 font-medium">미디어</th>
            <th className="px-4 py-3 font-medium">파이프라인</th>
            <th className="px-4 py-3 font-medium">
              {mode === "progress" ? "NCS 검토" : "점수"}
            </th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {filtered.map((s) => {
            const w = getWorker(s.workerId);
            const c = mediaCounts(s);
            const pipe = sessionPipelineLabel(s);
            const primary = getSessionPrimaryVideoId(s);
            const jobs = getJobsBySession(s.id);
            const avgProgress = jobs.length
              ? Math.round(
                  jobs.reduce((a, j) => a + j.progress, 0) / jobs.length,
                )
              : 0;

            return (
              <tr key={s.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <p className="font-mono text-xs font-semibold text-brand">
                    {s.regNo}
                  </p>
                  <p className="text-[10px] text-muted">{s.id}</p>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/workers/${s.workerId}/`}
                    className="font-medium hover:text-brand"
                  >
                    {w?.name}
                  </Link>
                  <p className="text-xs text-muted">{s.skill}</p>
                </td>
                <td className="px-4 py-3 text-xs text-muted">{s.examDate}</td>
                <td className="px-4 py-3 text-xs text-muted">
                  영상 {c.videos} · 사진 {c.products}
                </td>
                <td className="px-4 py-3">
                  {pipe === "completed" ? (
                    <StatusBadge status="completed" />
                  ) : pipe === "failed" ? (
                    <StatusBadge status="failed" />
                  ) : pipe === "in_pipeline" ? (
                    <div className="space-y-1">
                      <StatusBadge
                        status={
                          jobs.find((j) =>
                            [
                              "pose_extraction",
                              "analyzing",
                              "scoring",
                              "queued",
                              "preprocessing",
                            ].includes(j.status),
                          )?.status ?? "queued"
                        }
                      />
                      <div className="flex min-w-[6rem] items-center gap-1">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-bg">
                          <div
                            className="h-full rounded-full bg-brand"
                            style={{ width: `${avgProgress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted">
                          {avgProgress}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-muted">
                      {sessionStatusKo[s.status]}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {mode === "progress" ? (
                    <span className="text-muted">
                      {sessionNeedsNcsReview(s)
                        ? (s.ncsReviewStatus ?? "미검토")
                        : s.status === "completed"
                          ? (s.ncsReviewStatus ?? "—")
                          : "—"}
                    </span>
                  ) : s.skillScore != null ? (
                    <span className="font-semibold text-brand">
                      {s.skillScore}
                    </span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-xs">
                  <div className="flex flex-col items-end gap-1">
                    {s.status === "completed" ? (
                      <Link
                        href={`/evaluation/${s.id}/`}
                        className="text-brand hover:underline"
                      >
                        NCS 평가
                      </Link>
                    ) : null}
                    {primary ? (
                      <Link
                        href={`/analysis/${primary}/`}
                        className="text-muted hover:text-brand hover:underline"
                      >
                        대표 분석
                      </Link>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
