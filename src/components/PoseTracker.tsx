"use client";

import { useMemo, useState } from "react";
import poseLandmarks from "@/data/poseLandmarks.json";
import { asset } from "@/lib/asset";

type Landmark = { i: number; x: number; y: number; z: number; conf: number };
type Joint = { name: string; x: number; y: number; z?: number; conf: number };
type FramePose = { t: number; joints: Joint[]; all: Landmark[] };

const CONNECTIONS: [number, number][] = [
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28],
  [15, 17],
  [15, 19],
  [16, 18],
  [16, 20],
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 7],
  [0, 4],
  [4, 5],
  [5, 6],
  [6, 8],
];

const KEY_JOINTS = new Set([
  0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28,
]);

type ViewMode = "original" | "overlay" | "skeleton";

function formatTime(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function PoseTracker({
  videoId,
  videoName,
}: {
  videoId: string;
  videoName: string;
}) {
  const frames = useMemo(() => {
    const bucket = (poseLandmarks as Record<string, Record<string, FramePose>>)[
      videoId
    ];
    if (!bucket) return [];
    return Object.entries(bucket)
      .map(([file, pose]) => ({
        file,
        pose,
        cleanSrc: asset(`/evidence/${videoId}/${file}`),
        overlaySrc: asset(`/evidence/pose/${videoId}-${file}`),
      }))
      .sort((a, b) => a.pose.t - b.pose.t);
  }, [videoId]);

  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState<ViewMode>("overlay");
  const current = frames[idx] ?? frames[0];

  if (!current) {
    return (
      <p className="text-sm text-muted">자세 추적 데이터가 없습니다.</p>
    );
  }

  const byIndex = new Map(current.pose.all.map((p) => [p.i, p]));
  const showImage = mode !== "skeleton";
  const showSvg = mode === "overlay" || mode === "skeleton";
  const imgSrc = mode === "original" ? current.cleanSrc : current.cleanSrc;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {frames.map((f, i) => (
            <button
              key={f.file}
              type="button"
              onClick={() => setIdx(i)}
              className={`rounded-md border px-2 py-1 font-mono text-[11px] ${
                i === idx
                  ? "border-brand bg-brand-soft text-brand"
                  : "border-line bg-bg text-muted hover:border-brand/40"
              }`}
            >
              {formatTime(f.pose.t)}
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-lg border border-line p-0.5 text-xs">
          {(
            [
              ["original", "Original"],
              ["overlay", "Pose Overlay"],
              ["skeleton", "Skeleton"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={`rounded-md px-2.5 py-1 ${
                mode === id ? "bg-brand text-white" : "text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-950">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt={`자세 추적 ${formatTime(current.pose.t)}`}
            className={`absolute inset-0 h-full w-full object-cover ${
              mode === "overlay" ? "opacity-75" : "opacity-100"
            }`}
          />
        ) : null}
        {showSvg ? (
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 1 1"
            preserveAspectRatio="none"
          >
            {CONNECTIONS.map(([a, b]) => {
              const pa = byIndex.get(a);
              const pb = byIndex.get(b);
              if (!pa || !pb || pa.conf < 0.35 || pb.conf < 0.35) return null;
              if (pa.y > 1.05 || pb.y > 1.05) return null;
              return (
                <line
                  key={`${a}-${b}`}
                  x1={pa.x}
                  y1={pa.y}
                  x2={pb.x}
                  y2={pb.y}
                  stroke="#38bdf8"
                  strokeWidth={mode === "skeleton" ? 0.006 : 0.004}
                  strokeLinecap="round"
                />
              );
            })}
            {current.pose.all.map((p) => {
              if (p.conf < 0.35 || p.y > 1.05) return null;
              const key = KEY_JOINTS.has(p.i);
              return (
                <circle
                  key={p.i}
                  cx={p.x}
                  cy={p.y}
                  r={key ? (mode === "skeleton" ? 0.012 : 0.01) : 0.005}
                  fill={key ? "#10b981" : "#fbbf24"}
                  stroke="white"
                  strokeWidth={0.002}
                />
              );
            })}
          </svg>
        ) : null}
        <div className="absolute bottom-3 left-3 rounded bg-black/65 px-2.5 py-1.5 text-xs text-white">
          {videoName} · t={formatTime(current.pose.t)} · {mode}
        </div>
        <div className="absolute right-3 top-3 rounded bg-black/65 px-2 py-1 text-[11px] text-emerald-300">
          MediaPipe 33 ·{" "}
          {current.pose.joints.filter((j) => j.conf >= 0.5).length}/
          {current.pose.joints.length}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-line">
        <table className="w-full text-left text-xs">
          <thead className="bg-bg text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">관절</th>
              <th className="px-3 py-2 font-medium">x</th>
              <th className="px-3 py-2 font-medium">y</th>
              <th className="px-3 py-2 font-medium">z</th>
              <th className="px-3 py-2 font-medium">신뢰도</th>
            </tr>
          </thead>
          <tbody>
            {current.pose.joints.map((j) => (
              <tr key={j.name} className="border-t border-line">
                <td className="px-3 py-1.5 font-medium">{j.name}</td>
                <td className="px-3 py-1.5 font-mono">{j.x.toFixed(3)}</td>
                <td className="px-3 py-1.5 font-mono">{j.y.toFixed(3)}</td>
                <td className="px-3 py-1.5 font-mono">
                  {(j.z ?? 0).toFixed(3)}
                </td>
                <td className="px-3 py-1.5">
                  <span
                    className={
                      j.conf >= 0.8
                        ? "text-emerald-600"
                        : j.conf >= 0.5
                          ? "text-amber-600"
                          : "text-muted"
                    }
                  >
                    {(j.conf * 100).toFixed(0)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
