import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { SectionTabs, workerTabs } from "@/components/SectionTabs";
import { StatusBadge } from "@/components/StatusBadge";
import { workers } from "@/data/mock";

export default function WorkersListPage() {
  return (
    <AppShell
      title="기술자"
      subtitle="등록 인력 조회 · 직종 현황 · 숙련도 비교"
      actions={
        <span className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white opacity-90">
          기술자 등록
        </span>
      }
    >
      <SectionTabs tabs={workerTabs} />
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-bg text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">이름</th>
              <th className="px-4 py-3 font-medium">직종</th>
              <th className="px-4 py-3 font-medium">국적</th>
              <th className="px-4 py-3 font-medium">숙련도</th>
              <th className="px-4 py-3 font-medium">분석</th>
              <th className="px-4 py-3 font-medium">소속</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {workers.map((w) => (
              <tr key={w.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <p className="font-medium">{w.name}</p>
                  <p className="font-mono text-[11px] text-muted">{w.id}</p>
                </td>
                <td className="px-4 py-3">{w.skill}</td>
                <td className="px-4 py-3 text-muted">{w.nationality}</td>
                <td className="px-4 py-3">
                  {w.latestScore != null ? (
                    <span>
                      <span className="font-semibold text-brand">{w.latestScore}</span>
                      <span className="ml-1 text-xs text-muted">{w.latestLevel}</span>
                    </span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={w.analysisStatus} />
                  {w.highRisk ? (
                    <span className="ml-2 text-[11px] font-medium text-danger">주의</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-xs text-muted">
                  {w.company}
                  <br />
                  {w.agency}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/workers/${w.id}/`}
                    className="text-xs text-brand hover:underline"
                  >
                    상세
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
