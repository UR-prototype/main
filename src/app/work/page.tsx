import { WorkSessionsTable } from "@/components/WorkSessionsTable";

export default function WorkAllPage() {
  return (
    <div>
      <p className="mb-4 text-sm text-muted">
        <b className="font-medium text-ink">평가 세션</b> 전체입니다. 사람 ×
        평가기술 × 일자 × 등록번호 단위이며, 세션마다 영상·사진이 여러 개일 수
        있습니다.
      </p>
      <WorkSessionsTable mode="all" />
    </div>
  );
}
