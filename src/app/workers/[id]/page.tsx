import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ScoreTrendChart } from "@/components/DashboardCharts";
import { StatusBadge } from "@/components/StatusBadge";
import {
  getSessionsByWorker,
  getWorker,
  mediaCounts,
  workers,
} from "@/data/mock";
import { asset } from "@/lib/asset";
import { formatDuration } from "@/lib/status";

export function generateStaticParams() {
  return workers.map((w) => ({ id: w.id }));
}

const sessionStatusLabel = {
  draft: "작성중",
  in_progress: "진행중",
  completed: "완료",
  failed: "실패",
} as const;

export default async function WorkerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const worker = getWorker(id);
  if (!worker) notFound();
  const sessions = getSessionsByWorker(id);

  return (
    <AppShell
      title={worker.name}
      subtitle={`${worker.id} · ${worker.skill} · 평가 ${sessions.length}회`}
      actions={
        <div className="flex gap-2">
          <Link
            href="/register/"
            className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white"
          >
            새 평가 등록
          </Link>
          <Link
            href="/workers/"
            className="rounded-lg border border-line px-3 py-2 text-sm"
          >
            목록
          </Link>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-line bg-surface p-5">
          <h2 className="text-sm font-semibold">기본 정보</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row k="국적" v={worker.nationality} />
            <Row k="나이" v={String(worker.age)} />
            <Row k="주 직종" v={worker.skill} />
            <Row k="에이전시" v={worker.agency} />
            <Row k="회사" v={worker.company} />
            <Row k="등록일" v={worker.registeredAt} />
            <div className="flex justify-between gap-4">
              <dt className="text-muted">분석상태</dt>
              <dd>
                <StatusBadge status={worker.analysisStatus} />
              </dd>
            </div>
            <Row
              k="최근 숙련도"
              v={
                worker.latestScore != null
                  ? `${worker.latestScore} · ${worker.latestLevel}`
                  : "미분석"
              }
            />
          </dl>
        </section>

        <section className="rounded-xl border border-line bg-surface p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold">숙련도 추이</h2>
          {worker.scoreHistory.length ? (
            <ScoreTrendChart data={worker.scoreHistory} />
          ) : (
            <p className="py-10 text-center text-sm text-muted">이력 없음</p>
          )}
        </section>
      </div>

      <section className="mt-6 space-y-3">
        <div className="flex items-end justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold">숙련도 평가 세션</h2>
            <p className="text-xs text-muted">
              사람 × 평가 기술 × 일자 × 등록번호 단위 · 세션마다 영상·사진 복수
            </p>
          </div>
        </div>

        {sessions.map((s) => {
          const c = mediaCounts(s);
          const videos = s.media.filter((m) => m.kind === "video");
          const photos = s.media.filter((m) => m.kind !== "video");
          return (
            <article
              key={s.id}
              className="rounded-xl border border-line bg-surface p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-semibold text-brand">
                    {s.regNo}
                  </p>
                  <p className="mt-0.5 text-sm font-medium">
                    {s.skill} · {s.examDate}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {sessionStatusLabel[s.status]}
                    {s.assignee ? ` · ${s.assignee}` : ""}
                    {s.note ? ` · ${s.note}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold tabular-nums text-brand">
                    {s.skillScore ?? "—"}
                  </p>
                  <p className="text-xs text-muted">
                    {s.skillLevel ?? "미확정"} · 영상 {c.videos} · 사진{" "}
                    {c.products}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-[11px] font-semibold text-muted">
                    영상
                  </p>
                  <ul className="space-y-1 text-xs">
                    {videos.map((v) => (
                      <li
                        key={v.id}
                        className="flex items-center justify-between gap-2 rounded-md bg-bg px-2 py-1.5"
                      >
                        <span className="min-w-0 truncate">
                          <span className="font-mono text-muted">
                            {v.videoId ?? "—"}
                          </span>{" "}
                          {v.name}
                          {v.durationSec != null
                            ? ` · ${formatDuration(v.durationSec)}`
                            : ""}
                        </span>
                        {v.videoId &&
                        (v.videoId === "V-101" || v.videoId === "V-201") ? (
                          <Link
                            href={`/analysis/${v.videoId}/`}
                            className="shrink-0 text-brand hover:underline"
                          >
                            분석
                          </Link>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-semibold text-muted">
                    결과물 사진
                  </p>
                  {photos.length ? (
                    <div className="flex flex-wrap gap-2">
                      {photos.map((p) => (
                        <div
                          key={p.id}
                          className="w-20 overflow-hidden rounded border border-line bg-bg"
                        >
                          {p.src ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={asset(p.src)}
                              alt={p.name}
                              className="aspect-square w-full object-cover"
                            />
                          ) : (
                            <div className="flex aspect-square items-center justify-center text-[9px] text-muted">
                              파일
                            </div>
                          )}
                          <p className="truncate px-1 py-0.5 text-[9px] text-muted">
                            {p.kind === "product_ref"
                              ? "기준"
                              : p.kind === "product_candidate"
                                ? "결과"
                                : "추가"}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted">사진 없음</p>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <Link
                  href={`/evaluation/${s.id}/`}
                  className="text-brand hover:underline"
                >
                  세션 NCS 평가
                </Link>
                <Link
                  href={`/reports/${s.id}/`}
                  className="text-brand hover:underline"
                >
                  세션 평가서
                </Link>
                <Link
                  href="/register/product/"
                  className="text-brand hover:underline"
                >
                  사진 추가
                </Link>
              </div>
            </article>
          );
        })}

        {!sessions.length ? (
          <p className="rounded-xl border border-dashed border-line bg-surface py-10 text-center text-sm text-muted">
            평가 세션이 없습니다.{" "}
            <Link href="/register/" className="text-brand hover:underline">
              등록하기
            </Link>
          </p>
        ) : null}
      </section>
    </AppShell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </div>
  );
}
