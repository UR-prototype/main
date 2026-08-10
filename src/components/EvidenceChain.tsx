import Link from "next/link";
import type { AnalysisResult } from "@/data/mock";
import { getJob } from "@/data/mock";
import { eventMeta, stageMeta } from "@/data/ncs";

function fmt(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** 라벨 → Feature → 규칙 → 세션 NCS 근거 체인 */
export function EvidenceChain({
  result,
  videoId,
}: {
  result: AnalysisResult;
  videoId: string;
}) {
  const idle = result.ncsEvents?.find((e) => e.type === "EVENT_IDLE");
  const deduction = result.deductions.find((d) => d.key === "idle_long");
  const job = getJob(videoId);
  const evalHref = job?.sessionId
    ? `/evaluation/${job.sessionId}/`
    : "/evaluation/";

  if (!idle && !deduction) {
    return (
      <section className="rounded-lg border border-line bg-surface p-4">
        <h2 className="text-sm font-semibold">근거 체인</h2>
        <p className="mt-2 text-xs text-muted">
          Stage · Event 라벨이 연결되면 Idle 등 감점 경로가 여기에 표시됩니다.
        </p>
      </section>
    );
  }

  const stage = idle?.stageId ? stageMeta(idle.stageId) : null;
  const ev = idle ? eventMeta(idle.type) : null;

  return (
    <section className="rounded-lg border border-line bg-surface p-4">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">근거 체인 · 설명 가능성</h2>
          <p className="mt-0.5 text-[11px] text-muted">
            라벨 → Pose·Feature → 규칙 → 세션 NCS 평가
          </p>
        </div>
        <Link href="/labeling/" className="text-[11px] text-brand hover:underline">
          타임라인 라벨
        </Link>
      </div>

      <ol className="grid gap-2 md:grid-cols-4">
        <Step n={1} title="라벨러 · 사실">
          {idle ? (
            <>
              <p className="font-medium">{ev?.name}</p>
              <p className="font-mono text-[10px] text-muted">
                {fmt(idle.start)}–{fmt(idle.end)}
              </p>
              {stage ? (
                <p className="mt-1 text-[10px] text-muted">
                  {stage.id} · {stage.element}
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-muted">Event 없음</p>
          )}
        </Step>
        <Step n={2} title="Pose · Feature">
          <p>
            idle_time <b className="text-ink">{result.features.idle_time}s</b>
          </p>
          <p className="mt-1 text-[10px] text-muted">
            Pose 품질 {result.confidence.poseTrackingQuality}%
          </p>
        </Step>
        <Step n={3} title="규칙 엔진">
          {deduction ? (
            <>
              <p className="font-medium text-danger">
                {deduction.label} {deduction.impact}
              </p>
              <p className="mt-1 text-[10px] text-muted">{deduction.detail}</p>
            </>
          ) : (
            <p className="text-muted">감점 없음</p>
          )}
        </Step>
        <Step n={4} title="세션 · NCS">
          <p className="text-[11px]">
            숙련 확정은 영상 단위가 아니라 평가 세션 단위입니다.
          </p>
          <Link
            href={evalHref}
            className="mt-1 inline-block text-[11px] text-brand hover:underline"
          >
            세션 NCS 평가
          </Link>
        </Step>
      </ol>

      {result.ncsEvents && result.ncsEvents.length > 0 ? (
        <div className="mt-3 overflow-x-auto border-t border-line pt-3">
          <table className="w-full min-w-[32rem] text-left text-[11px]">
            <thead className="text-muted">
              <tr>
                <th className="py-1 pr-2 font-medium">Event</th>
                <th className="py-1 pr-2 font-medium">구간</th>
                <th className="py-1 pr-2 font-medium">Stage</th>
                <th className="py-1 font-medium">역할</th>
              </tr>
            </thead>
            <tbody>
              {result.ncsEvents.map((e) => {
                const meta = eventMeta(e.type);
                return (
                  <tr key={e.id} className="border-t border-line/80">
                    <td className="py-1.5 pr-2 font-medium">{meta.name}</td>
                    <td className="py-1.5 pr-2 font-mono text-muted">
                      {fmt(e.start)}–{fmt(e.end)}
                    </td>
                    <td className="py-1.5 pr-2 text-muted">
                      {e.stageId ?? "—"}
                    </td>
                    <td className="py-1.5 text-muted">{meta.role}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="rounded-md border border-line bg-bg px-2.5 py-2 text-xs">
      <p className="mb-1 text-[10px] font-semibold text-brand">
        {n}. {title}
      </p>
      <div className="text-[11px] leading-snug">{children}</div>
    </li>
  );
}
