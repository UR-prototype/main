import { WorkJobsTable } from "@/components/WorkJobsTable";

export default function WorkProgressPage() {
  return (
    <div>
      <p className="mb-4 text-sm text-muted">
        파이프라인 진행 중이거나, 분석은 끝났지만 검토·승인이 남은 건입니다.
        (기존 「분석 상태」 화면을 이 탭으로 통합)
      </p>
      <WorkJobsTable mode="progress" />
    </div>
  );
}
