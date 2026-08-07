import { WorkJobsTable } from "@/components/WorkJobsTable";

export default function WorkFailedPage() {
  return (
    <div>
      <p className="mb-4 text-sm text-muted">
        분석 실패 건만 모아 재실행·담당자 배정합니다. (기존 「실패 건」 메뉴를 이 탭으로 통합)
      </p>
      <WorkJobsTable mode="failed" />
    </div>
  );
}
