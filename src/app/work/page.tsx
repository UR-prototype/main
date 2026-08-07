import { WorkJobsTable } from "@/components/WorkJobsTable";

export default function WorkAllPage() {
  return (
    <div>
      <p className="mb-4 text-sm text-muted">
        등록된 작업 영상 전체입니다. 분석 상태·실패는 위 탭에서 같은 목록을 목적별로 봅니다.
      </p>
      <WorkJobsTable mode="all" />
    </div>
  );
}
