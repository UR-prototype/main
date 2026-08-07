"use client";

import { useMemo, useState } from "react";
import type {
  AnalysisResult,
  Deduction,
  EvidenceFrame,
  TimeSegment,
} from "@/data/mock";
import { asset } from "@/lib/asset";

function formatTime(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function nearestFrame(frames: EvidenceFrame[], t: number) {
  if (!frames.length) return null;
  return frames.reduce((best, cur) =>
    Math.abs(cur.t - t) < Math.abs(best.t - t) ? cur : best,
  );
}

type Marker = {
  t: number;
  label: string;
  kind: "idle" | "anomaly" | "work" | "key";
  deduction?: Deduction;
};

export function TimelineScrubber({
  result,
}: {
  result: AnalysisResult;
}) {
  const duration = useMemo(() => {
    const fromSeg = result.timeSegments.length
      ? Math.max(...result.timeSegments.map((s) => s.end))
      : 180;
    const fromDed = result.deductions.length
      ? Math.max(...result.deductions.map((d) => d.t))
      : 0;
    const fromEv = result.evidenceFrames.length
      ? Math.max(...result.evidenceFrames.map((f) => f.t))
      : 0;
    return Math.max(fromSeg, fromDed, fromEv, 120);
  }, [result]);

  const markers: Marker[] = useMemo(() => {
    const fromDeductions: Marker[] = result.deductions.map((d) => ({
      t: d.t,
      label: d.label,
      kind: d.key.includes("idle") ? "idle" : "anomaly",
      deduction: d,
    }));
    const fromSeg: Marker[] = result.timeSegments
      .filter((s) => s.type !== "work")
      .map((s) => ({
        t: s.start,
        label: s.label,
        kind: s.type,
      }));
    const merged = [...fromDeductions];
    for (const m of fromSeg) {
      if (!merged.some((x) => Math.abs(x.t - m.t) < 3)) merged.push(m);
    }
    return merged.sort((a, b) => a.t - b.t);
  }, [result]);

  const [t, setT] = useState(markers[0]?.t ?? 12);
  const frame = nearestFrame(result.evidenceFrames, t);
  const activeDeduction = result.deductions.find(
    (d) => Math.abs(d.t - t) < 5,
  );

  return (
    <section className="rounded-xl border border-line bg-surface p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">타임라인</h2>
        <p className="font-mono text-sm tabular-nums text-muted">
          {formatTime(t)}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          <SegmentBar
            segments={result.timeSegments}
            duration={duration}
            t={t}
            onSeek={setT}
          />
          <div className="relative h-2.5 rounded-full bg-bg">
            <input
              type="range"
              min={0}
              max={duration}
              step={1}
              value={t}
              onChange={(e) => setT(Number(e.target.value))}
              className="absolute inset-0 w-full cursor-pointer opacity-60"
              aria-label="timeline scrubber"
            />
            {markers.map((m) => (
              <button
                key={`${m.t}-${m.label}`}
                type="button"
                title={`${formatTime(m.t)} · ${m.label}`}
                onClick={() => setT(m.t)}
                className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ${
                  m.kind === "idle"
                    ? "bg-slate-500"
                    : m.kind === "anomaly"
                      ? "bg-amber-500"
                      : "bg-brand"
                } ${Math.abs(m.t - t) < 3 ? "ring-2 ring-brand" : ""}`}
                style={{ left: `${(m.t / duration) * 100}%` }}
              />
            ))}
          </div>

          {activeDeduction ? (
            <div className="rounded-lg border border-line bg-bg px-3 py-2 text-sm">
              <p className="font-medium">
                {activeDeduction.label}{" "}
                <span className="text-danger">{activeDeduction.impact}</span>
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {activeDeduction.detail}
              </p>
            </div>
          ) : null}

          <div className="space-y-1.5">
            {result.deductions.map((d) => (
              <button
                key={`${d.key}-${d.t}`}
                type="button"
                onClick={() => setT(d.t)}
                className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition ${
                  Math.abs(d.t - t) < 5
                    ? "bg-brand-soft text-brand"
                    : "text-muted hover:bg-bg hover:text-ink"
                }`}
              >
                <span className="truncate">{d.label}</span>
                <span className="shrink-0 font-mono text-xs">
                  {formatTime(d.t)} · {d.impact}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-line bg-slate-900">
          <div className="relative aspect-video">
            {frame ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={asset(frame.src)}
                alt={frame.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-white/70">
                장면 없음
              </div>
            )}
            <div className="absolute bottom-2 left-2 rounded bg-black/65 px-2 py-1 text-xs text-white">
              {frame ? `${formatTime(frame.t)} · ${frame.title}` : formatTime(t)}
            </div>
          </div>
          {frame ? (
            <p className="bg-surface px-3 py-2 text-xs leading-relaxed text-muted">
              {frame.finding}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function SegmentBar({
  segments,
  duration,
  t,
  onSeek,
}: {
  segments: TimeSegment[];
  duration: number;
  t: number;
  onSeek: (t: number) => void;
}) {
  return (
    <div className="relative flex h-9 overflow-hidden rounded-lg border border-line">
      {segments.map((s, i) => {
        const width = ((s.end - s.start) / duration) * 100;
        const color =
          s.type === "work"
            ? "bg-brand"
            : s.type === "idle"
              ? "bg-slate-300"
              : "bg-amber-500";
        return (
          <button
            key={`${s.start}-${i}`}
            type="button"
            title={`${s.label} (${s.start}s–${s.end}s)`}
            onClick={() => onSeek(s.start)}
            className={`${color} h-full transition hover:opacity-90`}
            style={{ width: `${width}%` }}
          />
        );
      })}
      <span
        className="pointer-events-none absolute top-0 h-full w-0.5 bg-white shadow"
        style={{ left: `${(t / duration) * 100}%` }}
      />
    </div>
  );
}
