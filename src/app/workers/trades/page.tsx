import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { SectionTabs, workerTabs } from "@/components/SectionTabs";
import { StatusBadge } from "@/components/StatusBadge";
import { getJobsByWorker, jobTypes, workers } from "@/data/mock";

export default function WorkersTradesPage() {
  return (
    <AppShell title="기술자" subtitle="직종별 인력 · 관련 영상으로 바로 이동">
      <SectionTabs tabs={workerTabs} />
      <p className="mb-4 text-sm text-muted">
        직종만 나열하지 않고, 해당 직종 기술자와 최근 영상을 붙여 분석·비교로 이어집니다.
      </p>
      <div className="space-y-5">
        {jobTypes.map((jt) => {
          const people = workers.filter((w) => w.skill === jt.id);
          const videos = people.flatMap((w) =>
            getJobsByWorker(w.id).map((j) => ({ ...j, workerName: w.name })),
          );
          const recent = [...videos]
            .sort((a, b) => b.workDate.localeCompare(a.workDate))
            .slice(0, 4);
          const scored = people.filter((w) => w.latestScore != null);
          const avg =
            scored.length > 0
              ? Math.round(
                  scored.reduce((s, w) => s + (w.latestScore ?? 0), 0) / scored.length,
                )
              : null;

          return (
            <section
              key={jt.id}
              className="rounded-xl border border-line bg-surface p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold">{jt.id}</h2>
                    <SupportBadge supported={jt.supported} />
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    인력 {people.length}명
                    {avg != null ? ` · 평균 ${avg}점` : " · 분석 이력 없음"}
                  </p>
                </div>
                <Link
                  href={`/workers/compare/?trade=${encodeURIComponent(jt.id)}`}
                  className="text-xs font-medium text-brand hover:underline"
                >
                  이 직종 비교 →
                </Link>
              </div>

              {jt.features.length ? (
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {jt.features.map((f) => (
                    <li
                      key={f}
                      className="rounded-md border border-line bg-bg px-2 py-0.5 text-[11px] text-muted"
                    >
                      {featureLabel(f)}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-medium text-muted">기술자</p>
                  {people.length === 0 ? (
                    <p className="text-sm text-muted">등록 인력 없음</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {people.map((w) => (
                        <li key={w.id} className="flex items-center justify-between text-sm">
                          <Link href={`/workers/${w.id}/`} className="hover:text-brand">
                            {w.name}
                          </Link>
                          <span className="tabular-nums text-muted">
                            {w.latestScore ?? "—"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium text-muted">관련 영상</p>
                  {recent.length === 0 ? (
                    <p className="text-sm text-muted">영상 없음</p>
                  ) : (
                    <ul className="space-y-2">
                      {recent.map((j) => (
                        <li
                          key={j.id}
                          className="flex items-center justify-between gap-2 text-sm"
                        >
                          <div className="min-w-0">
                            <p className="truncate">
                              {j.workerName}{" "}
                              <span className="font-mono text-[11px] text-muted">
                                {j.videoId}
                              </span>
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <StatusBadge status={j.status} />
                            {j.status === "completed" ? (
                              <Link
                                href={`/analysis/${j.videoId}/`}
                                className="text-xs text-brand hover:underline"
                              >
                                결과
                              </Link>
                            ) : (
                              <Link
                                href="/work/"
                                className="text-xs text-muted hover:underline"
                              >
                                작업
                              </Link>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}

function SupportBadge({
  supported,
}: {
  supported: boolean | "demo";
}) {
  const label =
    supported === true ? "지원" : supported === "demo" ? "시범" : "준비 중";
  const cls =
    supported === true
      ? "bg-emerald-50 text-emerald-700"
      : supported === "demo"
        ? "bg-sky-50 text-sky-700"
        : "bg-slate-100 text-slate-600";
  return (
    <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      {label}
    </span>
  );
}

function featureLabel(f: string) {
  const map: Record<string, string> = {
    hand_travel: "손 이동량",
    cycle_count: "반복 사이클",
    idle_time: "정지 시간",
    tool_switch: "공구 교체",
    work_speed: "작업 속도",
    stability: "안정성",
  };
  return map[f] ?? f;
}
