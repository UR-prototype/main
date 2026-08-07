import type { PipelineStatus } from "@/data/mock";
import { PIPELINE_STEPS } from "@/data/mock";
import { pipelineIndex, statusLabel } from "@/lib/status";

const STEP_SHORT: Record<Exclude<PipelineStatus, "failed">, string> = {
  uploaded: "Upload",
  queued: "Queue",
  preprocessing: "Preprocess",
  pose_extraction: "Pose",
  analyzing: "Feature",
  scoring: "Score",
  completed: "Done",
};

export function PipelineProgress({
  status,
  progress,
  variant = "compact",
}: {
  status: PipelineStatus;
  progress: number;
  /** compact: 목록용 한 줄 · full: 상세 스테퍼 */
  variant?: "compact" | "full";
  /** @deprecated */
  detailed?: boolean;
}) {
  const idx = pipelineIndex(status);
  const failed = status === "failed";
  const allDone = status === "completed";

  if (allDone && variant === "compact") {
    return (
      <div className="flex items-center gap-2 text-xs text-ok">
        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-emerald-100">
          <span className="block h-full w-full rounded-full bg-ok" />
        </span>
        <span className="shrink-0 font-medium">완료</span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>{failed ? "실패" : statusLabel(status)}</span>
          <span className="font-mono">{progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-bg">
          <div
            className={`h-full rounded-full ${failed ? "bg-danger" : "bg-brand"}`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      </div>
    );
  }

  // full — 완료면 요약만
  if (allDone) {
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-ink">분석 진행</span>
        <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-ok">
          완료 · 100%
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-ink">분석 진행</span>
        <span className="text-muted">
          {failed ? (
            <span className="font-medium text-danger">실패</span>
          ) : (
            <>
              <span className="font-medium text-ink">{statusLabel(status)}</span>
              <span className="mx-1.5 opacity-40">·</span>
              <span className="font-mono">{progress}%</span>
            </>
          )}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-bg">
        <div
          className={`h-full rounded-full ${failed ? "bg-danger" : "bg-brand"}`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>

      <ol className="flex items-center justify-between gap-1">
        {PIPELINE_STEPS.map((step, i) => {
          const done = !failed && idx > i;
          const current = !failed && idx === i;
          const isFailHere = failed && i === Math.max(idx, 0);
          return (
            <li key={step} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <span
                className={`h-2 w-2 rounded-full ${
                  isFailHere
                    ? "bg-danger"
                    : done || current
                      ? "bg-brand"
                      : "bg-line"
                }`}
              />
              <span
                className={`max-w-full truncate text-[10px] ${
                  current || isFailHere ? "font-medium text-brand" : "text-muted"
                }`}
              >
                {STEP_SHORT[step as keyof typeof STEP_SHORT]}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
