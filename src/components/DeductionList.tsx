import type { Deduction, EvidenceFrame } from "@/data/mock";
import { asset } from "@/lib/asset";

function nearestFrame(frames: EvidenceFrame[], t: number) {
  if (!frames.length) return null;
  return frames.reduce((best, cur) =>
    Math.abs(cur.t - t) < Math.abs(best.t - t) ? cur : best,
  );
}

function formatTime(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function DeductionList({
  deductions,
  frames = [],
}: {
  deductions: Deduction[];
  frames?: EvidenceFrame[];
}) {
  if (!deductions.length) {
    return <p className="text-sm text-muted">감점 항목 없음</p>;
  }

  return (
    <ul className="space-y-3">
      {deductions.map((d) => {
        const frame = nearestFrame(frames, d.t);
        return (
          <li
            key={`${d.key}-${d.t}`}
            className="overflow-hidden rounded-lg border border-amber-200 bg-amber-50"
          >
            <div className="flex gap-3 p-2.5">
              {frame ? (
                <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-md bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset(frame.src)}
                    alt={frame.title}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-white">
                    {formatTime(d.t)}
                  </span>
                </div>
              ) : null}
              <div className="min-w-0 flex-1 py-0.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-amber-900">{d.label}</p>
                  <span className="shrink-0 text-sm font-semibold text-danger">
                    {d.impact}
                  </span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-amber-800/80">
                  {d.detail}
                </p>
                <p className="mt-1 text-[11px] text-muted">
                  {formatTime(d.t)} · 영향 지표: {d.metric}
                  {frame ? ` · 장면: ${frame.title}` : ""}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
