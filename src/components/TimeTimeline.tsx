import type { TimeSegment } from "@/data/mock";

export function TimeTimeline({ segments }: { segments: TimeSegment[] }) {
  const total = segments.length
    ? Math.max(...segments.map((s) => s.end)) - Math.min(...segments.map((s) => s.start))
    : 1;

  return (
    <div className="space-y-3">
      <div className="flex h-10 overflow-hidden rounded-lg border border-line">
        {segments.map((s, i) => {
          const width = ((s.end - s.start) / total) * 100;
          const color =
            s.type === "work"
              ? "bg-brand"
              : s.type === "idle"
                ? "bg-slate-300"
                : "bg-amber-500";
          return (
            <div
              key={`${s.start}-${i}`}
              title={`${s.label} (${s.start}s–${s.end}s)`}
              className={`${color} h-full`}
              style={{ width: `${width}%` }}
            />
          );
        })}
      </div>
      <ul className="space-y-2 text-sm">
        {segments.map((s, i) => (
          <li
            key={`${s.label}-${i}`}
            className="flex items-center justify-between rounded-lg border border-line px-3 py-2"
          >
            <span className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  s.type === "work"
                    ? "bg-brand"
                    : s.type === "idle"
                      ? "bg-slate-300"
                      : "bg-amber-500"
                }`}
              />
              {s.label}
            </span>
            <span className="font-mono text-xs text-muted">
              {s.start}s – {s.end}s
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
