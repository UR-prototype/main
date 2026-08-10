import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import {
  assessmentSessions,
  getWorker,
  mediaCounts,
  sessionNeedsNcsReview,
} from "@/data/mock";

export default function EvaluationListPage() {
  const rows = [...assessmentSessions]
    .filter((s) => s.status === "completed" || sessionNeedsNcsReview(s))
    .sort((a, b) => b.examDate.localeCompare(a.examDate));

  return (
    <AppShell
      title="숙련도 평가"
      subtitle="NCS 능력단위 기준 · 세션(등록번호) 단위 전문가 확정"
    >
      <p className="mb-4 text-sm text-muted">
        숙련도는{" "}
        <b className="font-medium text-ink">NCS(단순 사출금형 조립 · 안전규정준수)</b>{" "}
        루브릭으로 보며, 판정 단위는{" "}
        <b className="font-medium text-ink">평가 세션 1건</b>입니다. 영상·사진
        여러 개도 같은 시험 근거이고, AI 점수는 참고입니다. 상세 재생·근거는 각
        세션의 AI 분석·라벨링에서 확인합니다.
      </p>

      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-bg text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">등록번호</th>
              <th className="px-4 py-3 font-medium">기술자</th>
              <th className="px-4 py-3 font-medium">평가 기술</th>
              <th className="px-4 py-3 font-medium">일자</th>
              <th className="px-4 py-3 font-medium">미디어</th>
              <th className="px-4 py-3 font-medium">AI 참고</th>
              <th className="px-4 py-3 font-medium">NCS</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const w = getWorker(s.workerId);
              const c = mediaCounts(s);
              const ncs = s.ncsReviewStatus ?? "미검토";
              return (
                <tr key={s.id} className="border-t border-line">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">
                    {s.regNo}
                  </td>
                  <td className="px-4 py-3 font-medium">{w?.name}</td>
                  <td className="px-4 py-3">{s.skill}</td>
                  <td className="px-4 py-3 text-xs text-muted">{s.examDate}</td>
                  <td className="px-4 py-3 text-xs text-muted">
                    영상 {c.videos} · 사진 {c.products}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted">
                    {s.skillScore ?? "—"}
                    {s.skillScore != null ? (
                      <span className="ml-1 text-[11px]">(참고)</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs ${
                        ncs === "승인"
                          ? "bg-emerald-50 text-emerald-800"
                          : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {ncs === "승인" ? "확정" : ncs}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/evaluation/${s.id}/`}
                      className="text-xs font-medium text-brand hover:underline"
                    >
                      세션 평가
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
