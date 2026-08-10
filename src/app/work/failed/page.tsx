import { WorkSessionsTable } from "@/components/WorkSessionsTable";

export default function WorkFailedPage() {
  return (
    <div>
      <p className="mb-4 text-sm text-muted">
        세션 또는 세션 내 영상 분석이 실패한 건을 모아 재실행합니다.
      </p>
      <WorkSessionsTable mode="failed" />
    </div>
  );
}
