"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { SectionTabs, workerTabs } from "@/components/SectionTabs";
import {
  getAnalysis,
  getJobsByWorker,
  jobTypes,
  workers,
  type JobType,
} from "@/data/mock";

const trades = jobTypes.map((j) => j.id as JobType);

export default function CompareClient() {
  const params = useSearchParams();
  const initial = (params.get("trade") as JobType | null) ?? "금형조립";
  const [trade, setTrade] = useState<JobType>(
    trades.includes(initial) ? initial : "금형조립",
  );

  const rows = useMemo(() => {
    return workers
      .filter((w) => w.skill === trade)
      .map((w) => {
        const latestJob = [...getJobsByWorker(w.id)]
          .filter((j) => j.status === "completed")
          .sort((a, b) => b.workDate.localeCompare(a.workDate))[0];
        const analysis = latestJob ? getAnalysis(latestJob.videoId) : null;
        return {
          worker: w,
          videoId: latestJob?.videoId ?? null,
          metrics: analysis?.metrics ?? null,
          confidence: analysis?.confidence.aiConfidence ?? null,
        };
      })
      .sort(
        (a, b) => (b.worker.latestScore ?? -1) - (a.worker.latestScore ?? -1),
      );
  }, [trade]);

  const summary = useMemo(() => {
    const scored = rows.filter((r) => r.worker.latestScore != null);
    if (!scored.length) return null;
    const avg = Math.round(
      scored.reduce((s, r) => s + (r.worker.latestScore ?? 0), 0) / scored.length,
    );
    const max = Math.max(...scored.map((r) => r.worker.latestScore ?? 0));
    const min = Math.min(...scored.map((r) => r.worker.latestScore ?? 0));
    return { count: scored.length, avg, max, min };
  }, [rows]);

  return (
    <AppShell title="기술자" subtitle="직종 단위 표 비교 — 카드 나열 대신 한 표로 확인">
      <SectionTabs tabs={workerTabs} />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block text-xs text-muted">직종</span>
          <select
            value={trade}
            onChange={(e) => setTrade(e.target.value as JobType)}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm"
          >
            {trades.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        {summary ? (
          <div className="flex flex-wrap gap-4 rounded-lg border border-line bg-surface px-4 py-2 text-sm">
            <span>
              분석 인력 <b>{summary.count}</b>
            </span>
            <span>
              평균 <b className="text-brand">{summary.avg}</b>
            </span>
            <span>
              최고 <b>{summary.max}</b>
            </span>
            <span>
              최저 <b>{summary.min}</b>
            </span>
          </div>
        ) : (
          <p className="text-sm text-muted">이 직종에 분석 완료 인력이 없습니다.</p>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-bg text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">기술자</th>
              <th className="px-4 py-3 font-medium">숙련도</th>
              <th className="px-4 py-3 font-medium">등급</th>
              <th className="px-4 py-3 font-medium">속도</th>
              <th className="px-4 py-3 font-medium">안정</th>
              <th className="px-4 py-3 font-medium">반복</th>
              <th className="px-4 py-3 font-medium">정확</th>
              <th className="px-4 py-3 font-medium">신뢰도</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-10 text-center text-muted">
                  해당 직종 기술자가 없습니다.
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={r.worker.id} className="border-t border-line">
                  <td className="px-4 py-3 text-muted">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/workers/${r.worker.id}/`}
                      className="font-medium hover:text-brand"
                    >
                      {r.worker.name}
                    </Link>
                    <p className="font-mono text-[11px] text-muted">{r.worker.id}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand tabular-nums">
                    {r.worker.latestScore ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">{r.worker.latestLevel ?? "—"}</td>
                  <td className="px-4 py-3 tabular-nums">{r.metrics?.speed ?? "—"}</td>
                  <td className="px-4 py-3 tabular-nums">{r.metrics?.stability ?? "—"}</td>
                  <td className="px-4 py-3 tabular-nums">{r.metrics?.repetition ?? "—"}</td>
                  <td className="px-4 py-3 tabular-nums">{r.metrics?.accuracy ?? "—"}</td>
                  <td className="px-4 py-3 tabular-nums text-muted">
                    {r.confidence != null ? `${r.confidence}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.videoId ? (
                      <Link
                        href={`/analysis/${r.videoId}/`}
                        className="text-xs text-brand hover:underline"
                      >
                        분석
                      </Link>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
