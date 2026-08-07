import type { PipelineStatus } from "@/data/mock";
import { statusClass, statusLabel } from "@/lib/status";

export function StatusBadge({ status }: { status: PipelineStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${statusClass(status)}`}
    >
      {statusLabel(status)}
    </span>
  );
}
