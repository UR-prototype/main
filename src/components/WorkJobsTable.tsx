"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import {
  analyses,
  jobs,
  workers,
  type PipelineStatus,
  type WorkJob,
} from "@/data/mock";
import { formatDuration } from "@/lib/status";

const IN_PROGRESS: PipelineStatus[] = [
  "uploaded",
  "queued",
  "preprocessing",
  "pose_extraction",
  "analyzing",
  "scoring",
];

export function WorkJobsTable({
  mode,
}: {
  mode: "all" | "progress" | "failed";
}) {
  const [rows, setRows] = useState<WorkJob[]>(() => jobs.map((j) => ({ ...j })));

  const filtered = useMemo(() => {
    if (mode === "failed") return rows.filter((j) => j.status === "failed");
    if (mode === "progress") {
      return rows.filter(
        (j) =>
          IN_PROGRESS.includes(j.status) ||
          (j.status === "completed" &&
            (analyses[j.videoId]?.reviewStatus === "미검토" ||
              analyses[j.videoId]?.reviewStatus === "검토중" ||
              !analyses[j.videoId])),
      );
    }
    return [...rows].sort((a, b) => b.workDate.localeCompare(a.workDate));
  }, [mode, rows]);

  function retry(id: string) {
    setRows((prev) =>
      prev.map((j) =>
        j.id === id
          ? {
              ...j,
              status: "queued",
              progress: 5,
              errorCode: null,
              errorMessage: null,
            }
          : j,
      ),
    );
  }

  function assign(id: string, name: string) {
    setRows((prev) =>
      prev.map((j) => (j.id === id ? { ...j, assignee: name } : j)),
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-surface p-10 text-center text-sm text-muted">
        {mode === "failed"
          ? "처리할 실패 건이 없습니다."
          : mode === "progress"
            ? "진행·검토 대기 건이 없습니다."
            : "등록된 영상이 없습니다."}
      </div>
    );
  }

  if (mode === "failed") {
    return (
      <div className="space-y-3">
        {filtered.map((j) => {
          const w = workers.find((x) => x.id === j.workerId);
          return (
            <div
              key={j.id}
              className="rounded-xl border border-red-200 bg-surface p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {w?.name} · {j.jobType}
                  </p>
                  <p className="text-xs text-muted">
                    {j.videoId} · {j.videoName}
                  </p>
                  <p className="mt-2 text-sm text-danger">
                    [{j.errorCode}] {j.errorMessage}
                  </p>
                </div>
                <StatusBadge status={j.status} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => retry(j.id)}
                  className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white"
                >
                  재실행
                </button>
                <select
                  className="rounded-md border border-line bg-bg px-2 py-1.5 text-xs"
                  value={j.assignee ?? ""}
                  onChange={(e) => assign(j.id, e.target.value)}
                >
                  <option value="">담당자 배정</option>
                  <option value="김평가">김평가</option>
                  <option value="이운영">이운영</option>
                  <option value="박분석">박분석</option>
                </select>
                <Link
                  href={`/workers/${j.workerId}/`}
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
            <th className="px-4 py-3 font-medium">기술자</th>
            <th className="px-4 py-3 font-medium">영상</th>
            <th className="px-4 py-3 font-medium">날짜</th>
            <th className="px-4 py-3 font-medium">길이</th>
            <th className="px-4 py-3 font-medium">상태</th>
            <th className="px-4 py-3 font-medium">진행</th>
            {mode === "progress" ? (
              <th className="px-4 py-3 font-medium">검토</th>
            ) : (
              <th className="px-4 py-3 font-medium">점수</th>
            )}
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {filtered.map((j) => {
            const worker = workers.find((w) => w.id === j.workerId);
            const analysis = analyses[j.videoId];
            const score = j.skillScore ?? analysis?.skillScore ?? null;
            const review = analysis?.reviewStatus ?? (j.status === "completed" ? "미검토" : "—");
            return (
              <tr key={j.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <Link
                    href={`/workers/${j.workerId}/`}
                    className="font-medium hover:text-brand"
                  >
                    {worker?.name}
                  </Link>
                  <p className="text-xs text-muted">{j.jobType}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="max-w-[12rem] truncate text-xs">{j.videoName}</p>
                  <p className="font-mono text-[11px] text-muted">{j.videoId}</p>
                </td>
                <td className="px-4 py-3 text-xs text-muted">{j.workDate}</td>
                <td className="px-4 py-3 text-xs text-muted">
                  {formatDuration(j.durationSec)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={j.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex min-w-[7rem] items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg">
                      <div
                        className={`h-full rounded-full ${
                          j.status === "failed" ? "bg-danger" : "bg-brand"
                        }`}
                        style={{ width: `${j.progress}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-[11px] text-muted">
                      {j.progress}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  {mode === "progress" ? (
                    <span className="text-muted">{review}</span>
                  ) : score != null ? (
                    <span className="font-semibold text-brand">{score}</span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {j.status === "completed" ? (
                    <Link
                      href={`/analysis/${j.videoId}/`}
                      className="text-xs text-brand hover:underline"
                    >
                      결과
                    </Link>
                  ) : j.status === "failed" ? (
                    <button
                      type="button"
                      onClick={() => retry(j.id)}
                      className="text-xs text-danger hover:underline"
                    >
                      재실행
                    </button>
                  ) : (
                    <span className="text-xs text-muted">대기</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
