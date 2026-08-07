"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { TradeScoreLineChart } from "@/components/DashboardCharts";
import { SectionTabs, workerTabs } from "@/components/SectionTabs";
import { StatusBadge } from "@/components/StatusBadge";
import {
  getAnalysis,
  getJobsByWorker,
  jobTypes,
  workers,
  type JobType,
} from "@/data/mock";

const TRADE_OPTIONS: Array<JobType | "전체"> = [
  "전체",
  "금형조립",
  "기계가공",
  "용접",
  "프레스",
  "사출",
];

function featureLabel(f: string) {
  const map: Record<string, string> = {
    hand_travel: "손 이동량",
    cycle_count: "반복 사이클",
    idle_time: "정지 시간",
    tool_switch: "공구 교체",
    work_speed: "작업 속도",
    stability: "안정성",
  };
  return map[f] ?? f;
}

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

  const tradeMeta = useMemo(() => {
    if (trade === "전체") return null;
    const jt = jobTypes.find((j) => j.id === trade);
    const people = workers.filter((w) => w.skill === trade);
    const videos = people
      .flatMap((w) =>
        getJobsByWorker(w.id).map((j) => ({ ...j, workerName: w.name })),
      )
      .sort((a, b) => b.workDate.localeCompare(a.workDate))
      .slice(0, 4);
    return { jt, videos };
  }, [trade]);

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
        const analysis = completed ? getAnalysis(completed.videoId) : null;
        return {
          worker: w,
          videoId: completed?.videoId ?? latestJob?.videoId ?? null,
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
    <AppShell title="기술자" subtitle="직종별 숙련도 · 인력 비교">
      <SectionTabs tabs={workerTabs} />

      <section className="mb-5 rounded-xl border border-line bg-surface p-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold">직종별 숙련도</h2>
            <p className="text-xs text-muted">
              평균·최고 점수 꺾은선 · 점을 클릭하면 아래가 해당 직종으로 필터됩니다.
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
          onSelectTrade={(t) => setTrade(t as JobType)}
        />
      </section>

      {tradeMeta?.jt ? (
        <section className="mb-5 rounded-xl border border-line bg-surface p-5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold">{trade}</h2>
            <SupportBadge supported={tradeMeta.jt.supported} />
          </div>
          <p className="mt-1 text-xs text-muted">{tradeMeta.jt.note}</p>
          {tradeMeta.jt.features.length ? (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {tradeMeta.jt.features.map((f) => (
                <li
                  key={f}
                  className="rounded-md border border-line bg-bg px-2 py-0.5 text-[11px] text-muted"
                >
                  {featureLabel(f)}
                </li>
              ))}
            </ul>
          ) : null}
          {tradeMeta.videos.length ? (
            <div className="mt-4 border-t border-line pt-4">
              <p className="mb-2 text-xs font-medium text-muted">관련 영상</p>
              <ul className="space-y-2">
                {tradeMeta.videos.map((j) => (
                  <li
                    key={j.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate">
                        {j.workerName}{" "}
                        <span className="font-mono text-[11px] text-muted">
                          {j.videoId}
                        </span>
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={j.status} />
                      {j.status === "completed" ? (
                        <Link
                          href={`/analysis/${j.videoId}/`}
                          className="text-xs text-brand hover:underline"
                        >
                          결과
                        </Link>
                      ) : (
                        <Link
                          href="/work/"
                          className="text-xs text-muted hover:underline"
                        >
                          작업
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

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

function SupportBadge({ supported }: { supported: boolean | "demo" }) {
  const label =
    supported === true ? "지원" : supported === "demo" ? "시범" : "준비 중";
  const cls =
    supported === true
      ? "bg-emerald-50 text-emerald-700"
      : supported === "demo"
        ? "bg-sky-50 text-sky-700"
        : "bg-slate-100 text-slate-600";
  return (
    <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      {label}
    </span>
  );
}
