import type { PipelineStatus, ReviewStatus } from "@/data/mock";
import { StatusBadge } from "@/components/StatusBadge";

/** SSLO 라벨링 스튜디오 헤더 감성: 단계 · 상태 · 담당 */
export function StudioMetaBar({
  stage,
  pipelineStatus,
  reviewStatus,
  assignee,
  fps,
  frames,
}: {
  stage: string;
  pipelineStatus: PipelineStatus;
  reviewStatus?: ReviewStatus | string;
  assignee?: string | null;
  fps?: number;
  frames?: number;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-line bg-surface px-4 py-3 text-sm">
      <Meta label="단계" value={stage} />
      <span className="hidden h-4 w-px bg-line sm:block" aria-hidden />
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted">상태</span>
        <StatusBadge status={pipelineStatus} />
      </div>
      {reviewStatus ? (
        <>
          <span className="hidden h-4 w-px bg-line sm:block" aria-hidden />
          <Meta label="검토" value={String(reviewStatus)} />
        </>
      ) : null}
      <span className="hidden h-4 w-px bg-line sm:block" aria-hidden />
      <Meta label="담당" value={assignee?.trim() ? assignee : "미배정"} />
      {fps != null ? (
        <>
          <span className="hidden h-4 w-px bg-line sm:block" aria-hidden />
          <Meta label="FPS" value={String(fps)} />
        </>
      ) : null}
      {frames != null ? (
        <>
          <span className="hidden h-4 w-px bg-line sm:block" aria-hidden />
          <Meta label="프레임" value={frames.toLocaleString()} />
        </>
      ) : null}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}
