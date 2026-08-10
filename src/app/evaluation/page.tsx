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
      subtitle="평가 세션 단위 · NCS·전문가 확정 (영상 1건 ≠ 평가 1건)"
    >
      <p className="mb-4 text-sm text-muted">
        숙련도 판정은{" "}
        <b className="font-medium text-ink">등록번호(세션)</b> 기준입니다. 세션에
        영상·결과물 사진이 여러 개여도 NCS 평가는 한 번입니다. AI 점수는 참고
        근거입니다.
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
