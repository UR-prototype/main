"use client";

import { useState } from "react";
import type { EvidenceFrame } from "@/data/mock";
import { asset } from "@/lib/asset";

function formatTime(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** SSLO 클리닝 스튜디오 프레임 스트립 감성 */
export function FrameRail({
  frames,
  title = "근거 프레임",
}: {
  frames: EvidenceFrame[];
  title?: string;
}) {
  const [active, setActive] = useState(0);
  if (!frames.length) return null;
  const current = frames[Math.min(active, frames.length - 1)]!;

  return (
    <section className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-3 flex items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="text-xs text-muted">
            {current.title} · {formatTime(current.t)}
            {current.impact != null ? ` · 감점 ${current.impact}` : ""}
          </p>
        </div>
        <p className="text-[11px] text-muted">
          {active + 1} / {frames.length}
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-slate-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset(current.src)}
          alt={current.title}
          className="mx-auto max-h-64 w-full object-contain"
        />
      </div>
      <p className="mt-2 text-xs text-muted">{current.finding}</p>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {frames.map((f, i) => (
          <button
            key={`${f.t}-${f.src}`}
            type="button"
            onClick={() => setActive(i)}
            className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-md border ${
              i === active
                ? "border-brand ring-2 ring-brand/30"
                : "border-line opacity-80 hover:opacity-100"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset(f.src)}
              alt=""
              className="h-full w-full object-cover"
            />
            <span className="absolute bottom-0 inset-x-0 bg-black/55 px-1 py-0.5 text-[9px] text-white">
              {formatTime(f.t)}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
