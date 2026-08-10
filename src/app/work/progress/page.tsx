import { WorkSessionsTable } from "@/components/WorkSessionsTable";

export default function WorkProgressPage() {
  return (
    <div>
      <p className="mb-4 text-sm text-muted">
        세션 파이프라인이 진행 중이거나, 분석은 끝났지만{" "}
        <b className="font-medium text-ink">세션 NCS 검토</b>가 남은 건입니다.
      </p>
      <WorkSessionsTable mode="progress" />
    </div>
  );
}
