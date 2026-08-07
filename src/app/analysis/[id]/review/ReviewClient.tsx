"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AnalysisTabs } from "@/components/AnalysisTabs";
import { AppShell } from "@/components/AppShell";
import { DeductionList } from "@/components/DeductionList";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import { StatusBadge } from "@/components/StatusBadge";
import { getAnalysis, getJob, getWorker } from "@/data/mock";

export default function ReviewClient() {
  const { id } = useParams<{ id: string }>();
  const job = getJob(id);
  const analysis = getAnalysis(id);
  const worker = job ? getWorker(job.workerId) : undefined;
  const [manual, setManual] = useState(
    analysis?.manualScore ?? analysis?.skillScore ?? 0,
  );
  const [comment, setComment] = useState(analysis?.manualComment ?? "");
  const [status, setStatus] = useState(analysis?.reviewStatus ?? "미검토");
  const [saved, setSaved] = useState(false);

  if (!job) {
    return (
      <AppShell title="검토">
        <p className="text-sm text-muted">영상을 찾을 수 없습니다.</p>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="검토 · 승인"
      subtitle={`${worker?.name ?? job.workerId} · 점수 보정 및 승인`}
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
          분석 완료 후 검토할 수 있습니다. <StatusBadge status={job.status} />
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-5">
          <div className="space-y-5 lg:col-span-3">
            <section className="rounded-xl border border-line bg-surface p-5">
              <h2 className="mb-3 text-sm font-semibold">시스템 점수</h2>
              <ScoreBreakdown result={analysis} />
            </section>
            <section className="rounded-xl border border-line bg-surface p-5">
              <h2 className="mb-3 text-sm font-semibold">감점 근거</h2>
              <DeductionList
                deductions={analysis.deductions}
                frames={analysis.evidenceFrames}
              />
            </section>
          </div>

          <section className="rounded-xl border border-line bg-surface p-5 lg:col-span-2">
            <h2 className="text-sm font-semibold">평가자 검토</h2>
            <p className="mt-1 text-xs text-muted">
              AI {analysis.skillScore}점 · 신뢰도{" "}
              {analysis.confidence.aiConfidence}%
            </p>

            <label className="mt-4 block text-sm">
              <span className="mb-1 block text-xs text-muted">보정 점수</span>
              <input
                type="number"
                min={0}
                max={100}
                value={manual}
                onChange={(e) => setManual(Number(e.target.value))}
                className="w-full rounded-lg border border-line bg-bg px-3 py-2"
              />
            </label>

            <label className="mt-3 block text-sm">
              <span className="mb-1 block text-xs text-muted">검토 상태</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="w-full rounded-lg border border-line bg-bg px-3 py-2"
              >
                <option value="미검토">미검토</option>
                <option value="검토중">검토중</option>
                <option value="승인">승인</option>
                <option value="반려">반려</option>
              </select>
            </label>

            <label className="mt-3 block text-sm">
              <span className="mb-1 block text-xs text-muted">코멘트</span>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-lg border border-line bg-bg px-3 py-2"
                placeholder="보정 사유, 현장 메모"
              />
            </label>

            <button
              type="button"
              onClick={() => setSaved(true)}
              className="mt-4 w-full rounded-lg bg-brand py-2.5 text-sm font-medium text-white"
            >
              검토 저장
            </button>
            {saved ? (
              <p className="mt-2 text-center text-xs text-ok">
                저장되었습니다. (프로토타입 · 로컬 상태)
              </p>
            ) : null}
          </section>
        </div>
      )}
    </AppShell>
  );
}
