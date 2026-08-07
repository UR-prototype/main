"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/data/mock";

const METRIC_HELP: Record<
  "speed" | "stability" | "repetition" | "accuracy",
  { title: string; keys: { label: string; value: (r: AnalysisResult) => string }[] }
> = {
  speed: {
    title: "작업 속도",
    keys: [
      { label: "Cycle", value: (r) => String(r.features.cycle_count) },
      { label: "Idle", value: (r) => `${r.features.idle_time}s` },
      { label: "Motion", value: (r) => String(r.features.motion_energy) },
      { label: "Work Speed", value: (r) => String(r.features.work_speed) },
      {
        label: "작업/정지",
        value: (r) =>
          `${r.metrics.workSeconds}s / ${r.metrics.idleSeconds}s`,
      },
    ],
  },
  stability: {
    title: "작업 안정성",
    keys: [
      { label: "Hand Travel", value: (r) => `${r.features.hand_travel}` },
      {
        label: "Joint Angle Var",
        value: (r) => String(r.features.joint_angle_var),
      },
      { label: "Motion", value: (r) => String(r.features.motion_energy) },
    ],
  },
  repetition: {
    title: "반복성",
    keys: [
      { label: "Cycle Count", value: (r) => String(r.features.cycle_count) },
      {
        label: "Repeat Count",
        value: (r) => String(r.metrics.repeatCount),
      },
      { label: "Work Speed", value: (r) => String(r.features.work_speed) },
    ],
  },
  accuracy: {
    title: "정확도",
    keys: [
      {
        label: "Tool Switch",
        value: (r) => String(r.features.tool_switch_count),
      },
      {
        label: "Joint Angle Var",
        value: (r) => String(r.features.joint_angle_var),
      },
      {
        label: "결과물 판정",
        value: (r) =>
          `${r.productJudgment.overall} (${r.productJudgment.score})`,
      },
    ],
  },
};

export function ScoreBreakdown({ result }: { result: AnalysisResult }) {
  const [open, setOpen] = useState<keyof typeof METRIC_HELP | null>(null);
  const rows = [
    { key: "speed" as const, label: "작업 속도", weight: result.weights.speed },
    {
      key: "stability" as const,
      label: "작업 안정성",
      weight: result.weights.stability,
    },
    {
      key: "repetition" as const,
      label: "반복성",
      weight: result.weights.repetition,
    },
    {
      key: "accuracy" as const,
      label: "정확도",
      weight: result.weights.accuracy,
    },
  ];

  const detail = open ? METRIC_HELP[open] : null;

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-bg text-xs text-muted">
            <tr>
              <th className="px-3 py-2">항목</th>
              <th className="px-3 py-2">점수</th>
              <th className="px-3 py-2">가중치</th>
              <th className="px-3 py-2">기여</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.key}
                className="cursor-pointer border-t border-line hover:bg-brand-soft/40"
                onClick={() => setOpen(r.key)}
              >
                <td className="px-3 py-2 font-medium text-brand underline-offset-2 hover:underline">
                  {r.label}
                </td>
                <td className="px-3 py-2">{result.metrics[r.key]}</td>
                <td className="px-3 py-2 text-muted">
                  {Math.round(r.weight * 100)}%
                </td>
                <td className="px-3 py-2 font-semibold text-brand">
                  {result.contributions[r.key]}
                </td>
              </tr>
            ))}
            <tr className="border-t border-line bg-brand-soft/40">
              <td className="px-3 py-2 font-semibold" colSpan={3}>
                Skill Score
              </td>
              <td className="px-3 py-2 text-lg font-semibold text-brand">
                {result.skillScore}
              </td>
            </tr>
          </tbody>
        </table>
        <p className="border-t border-line px-3 py-2 text-[11px] text-muted">
          항목을 클릭하면 Feature 상세를 확인할 수 있습니다.
        </p>
      </div>

      {detail && open ? (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/30"
          onClick={() => setOpen(null)}
        >
          <aside
            className="h-full w-full max-w-md overflow-y-auto bg-surface p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-brand">
                  Feature Detail
                </p>
                <h3 className="mt-1 text-lg font-semibold">{detail.title}</h3>
                <p className="mt-1 text-3xl font-semibold text-brand">
                  {result.metrics[open]}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="rounded-lg border border-line px-2.5 py-1 text-sm"
              >
                닫기
              </button>
            </div>
            <dl className="mt-6 space-y-3">
              {detail.keys.map((k) => (
                <div
                  key={k.label}
                  className="flex items-center justify-between rounded-lg border border-line px-3 py-2.5"
                >
                  <dt className="text-sm text-muted">{k.label}</dt>
                  <dd className="font-mono text-sm font-semibold">
                    {k.value(result)}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 rounded-lg bg-bg p-3 text-xs leading-relaxed text-muted">
              가중치 {Math.round(result.weights[open] * 100)}% · 기여 점수{" "}
              {result.contributions[open]}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
