"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { TradeScoreLineChart } from "@/components/DashboardCharts";
import { SectionTabs, workerTabs } from "@/components/SectionTabs";
import {
  getAnalysis,
  getJobsByWorker,
  workers,
  type JobType,
} from "@/data/mock";

/** 실제 기술자 skill 기준 — jobTypes의 CNC/검사 등 빈 직종 제외 */
const TRADE_OPTIONS: Array<JobType | "전체"> = [
  "전체",
  "금형조립",
  "기계가공",
  "용접",
  "프레스",
  "사출",
];

export default function CompareClient() {
  const params = useSearchParams();
  const q = params.get("trade");
  const initial: JobType | "전체" =
    q && TRADE_OPTIONS.includes(q as JobType | "전체")
      ? (q as JobType | "전체")
      : "전체";
  const [trade, setTrade] = useState<JobType | "전체">(initial);

  const tradeSummary = useMemo(() => {
    return (TRADE_OPTIONS.filter((t) => t !== "전체") as JobType[]).map(
      (t) => {
        const list = workers.filter((w) => w.skill === t);
        const scored = list.filter((w) => w.latestScore != null);
        const avg =
          scored.length > 0
            ? Math.round(
                scored.reduce((s, w) => s + (w.latestScore ?? 0), 0) /
                  scored.length,
              )
            : null;
        return {
          trade: t,
          count: list.length,
          scored: scored.length,
          avg,
          max:
            scored.length > 0
              ? Math.max(...scored.map((w) => w.latestScore ?? 0))
              : null,
        };
      },
    );
  }, []);

  const rows = useMemo(() => {
    const list =
      trade === "전체" ? workers : workers.filter((w) => w.skill === trade);
    return list
      .map((w) => {
        const latestJob = [...getJobsByWorker(w.id)].sort((a, b) =>
          b.workDate.localeCompare(a.workDate),
        )[0];
        const completed = [...getJobsByWorker(w.id)]
          .filter((j) => j.status === "completed")
          .sort((a, b) => b.workDate.localeCompare(a.workDate))[0];
        const analysis = completed
          ? getAnalysis(completed.videoId)
          : null;
        return {
          worker: w,
          videoId: completed?.videoId ?? latestJob?.videoId ?? null,
          jobStatus: latestJob?.status ?? w.analysisStatus,
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
      scored.reduce((s, r) => s + (r.worker.latestScore ?? 0), 0) /
        scored.length,
    );
    return {
      count: rows.length,
      scored: scored.length,
      avg,
      max: Math.max(...scored.map((r) => r.worker.latestScore ?? 0)),
      min: Math.min(...scored.map((r) => r.worker.latestScore ?? 0)),
    };
  }, [rows]);

  return (
    <AppShell title="기술자" subtitle="직종별 숙련도 추이 · 인력 비교 표">
      <SectionTabs tabs={workerTabs} />

      <section className="mb-5 rounded-xl border border-line bg-surface p-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold">직종별 숙련도</h2>
            <p className="text-xs text-muted">
              평균·최고 점수 꺾은선 · 점을 클릭하면 아래 표가 필터됩니다.
            </p>
          </div>
          {trade !== "전체" ? (
            <button
              type="button"
              onClick={() => setTrade("전체")}
              className="text-xs text-brand hover:underline"
            >
              전체 보기
            </button>
          ) : null}
        </div>
        <TradeScoreLineChart
          data={tradeSummary}
          activeTrade={trade === "전체" ? undefined : trade}
          onSelectTrade={(t) => setTrade(t as JobType)}
        />
      </section>

      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <label className="text-sm">
          <span className="mb-1 block text-xs text-muted">비교 대상</span>
          <select
            value={trade}
            onChange={(e) => setTrade(e.target.value as JobType | "전체")}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm"
          >
            {TRADE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        {summary ? (
          <div className="flex flex-wrap gap-4 rounded-lg border border-line bg-surface px-4 py-2 text-sm">
            <span>
              인원 <b>{summary.count}</b>
            </span>
            <span>
              분석 <b>{summary.scored}</b>
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
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-bg text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">기술자</th>
              <th className="px-4 py-3 font-medium">직종</th>
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
                <td colSpan={11} className="px-4 py-10 text-center text-muted">
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
                    <p className="font-mono text-[11px] text-muted">
                      {r.worker.id}
                    </p>
                  </td>
                  <td className="px-4 py-3">{r.worker.skill}</td>
                  <td className="px-4 py-3 font-semibold text-brand tabular-nums">
                    {r.worker.latestScore ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {r.worker.latestLevel ?? "—"}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {r.metrics?.speed ?? "—"}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {r.metrics?.stability ?? "—"}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {r.metrics?.repetition ?? "—"}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {r.metrics?.accuracy ?? "—"}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted">
                    {r.confidence != null ? `${r.confidence}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.videoId && r.metrics ? (
                      <Link
                        href={`/analysis/${r.videoId}/`}
                        className="text-xs text-brand hover:underline"
                      >
                        분석
                      </Link>
                    ) : r.videoId ? (
                      <Link
                        href="/work/progress/"
                        className="text-xs text-muted hover:underline"
                      >
                        진행
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
