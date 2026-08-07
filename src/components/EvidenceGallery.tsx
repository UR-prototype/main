import type { EvidenceFrame } from "@/data/mock";
import { asset } from "@/lib/asset";

const tagStyle: Record<EvidenceFrame["tag"], string> = {
  work: "bg-emerald-50 text-emerald-700 border-emerald-200",
  idle: "bg-slate-100 text-slate-700 border-slate-200",
  anomaly: "bg-amber-50 text-amber-800 border-amber-200",
  key: "bg-brand-soft text-brand border-brand/20",
};

const tagLabel: Record<EvidenceFrame["tag"], string> = {
  work: "정상 작업",
  idle: "정지",
  anomaly: "감점 구간",
  key: "핵심 장면",
};

function formatTime(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function EvidenceGallery({
  frames,
  highlightOnly = false,
}: {
  frames: EvidenceFrame[];
  highlightOnly?: boolean;
}) {
  const list = highlightOnly
    ? frames.filter((f) => f.tag === "anomaly" || f.tag === "idle" || f.impact)
    : frames;

  return (
    <section className="rounded-xl border border-line bg-surface p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-sm font-semibold">
          {highlightOnly ? "감점 · 핵심 장면" : "장면별 분석 근거"}
        </h2>
        <p className="text-xs text-muted">{list.length}장면</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {list.map((f) => (
          <article
            key={`${f.t}-${f.src}`}
            className="overflow-hidden rounded-xl border border-line bg-bg"
          >
            <div className="relative aspect-video bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset(f.src)}
                alt={f.title}
                className="h-full w-full object-cover"
              />
              <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 font-mono text-[11px] text-white">
                {formatTime(f.t)}
              </span>
              {f.impact != null ? (
                <span className="absolute right-2 top-2 rounded bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                  {f.impact}
                </span>
              ) : null}
            </div>
            <div className="space-y-2 p-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold leading-snug">{f.title}</h3>
                <span
                  className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium ${tagStyle[f.tag]}`}
                >
                  {tagLabel[f.tag]}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted">{f.finding}</p>
              {f.metric ? (
                <p className="text-[11px] text-brand">
                  반영 지표:{" "}
                  {f.metric === "speed"
                    ? "속도"
                    : f.metric === "stability"
                      ? "안정성"
                      : f.metric === "repetition"
                        ? "반복성"
                        : "정확도"}
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
