import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { analyses, getWorker, jobs } from "@/data/mock";

export default function EvaluationListPage() {
  const rows = jobs
    .filter((j) => j.status === "completed")
    .map((j) => {
      const a = analyses[j.videoId];
      const w = getWorker(j.workerId);
      return { job: j, analysis: a, worker: w };
    });

  return (
    <AppShell
      title="숙련도 평가"
      subtitle="NCS 기반 프로세스 · 전문가 의견 (AI 점수와 분리)"
    >
      <p className="mb-4 text-sm text-muted">
        숙련도 판정은 AI 자동 점수가 아니라{" "}
        <b className="font-medium text-ink">NCS 단위요소·전문가 검토</b>로
        확정합니다. AI·라벨 결과는 참고 근거입니다.
      </p>

      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-bg text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">기술자</th>
              <th className="px-4 py-3 font-medium">영상</th>
              <th className="px-4 py-3 font-medium">직종</th>
              <th className="px-4 py-3 font-medium">AI 참고</th>
              <th className="px-4 py-3 font-medium">NCS 평가</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ job, analysis, worker }) => (
              <tr key={job.id} className="border-t border-line">
                <td className="px-4 py-3 font-medium">{worker?.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted">
                  {job.videoId}
                </td>
                <td className="px-4 py-3">{job.jobType}</td>
                <td className="px-4 py-3 tabular-nums text-muted">
                  {analysis?.skillScore ?? "—"}
                  {analysis ? (
                    <span className="ml-1 text-[11px]">(참고)</span>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs text-amber-800">
                    {analysis?.reviewStatus === "승인" ? "확정" : "대기"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/evaluation/${job.videoId}/`}
                    className="text-xs font-medium text-brand hover:underline"
                  >
                    평가 작성
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
