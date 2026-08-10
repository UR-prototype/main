"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  getAnalysis,
  getJobsBySession,
  getSession,
  getSessionPrimaryVideoId,
  getWorker,
  mediaCounts,
} from "@/data/mock";
import { asset } from "@/lib/asset";
import {
  NCS_MOLD_ASSY,
  NCS_RUBRIC_ITEMS,
  NCS_SAFETY,
  SCENARIO_MOLD,
  eventMeta,
  stageMeta,
  type NcsElementId,
} from "@/data/ncs";
import { formatDuration } from "@/lib/status";

export default function EvaluationClient() {
  const { id } = useParams<{ id: string }>();
  const session = getSession(id);
  const worker = session ? getWorker(session.workerId) : undefined;
  const sessionJobs = session ? getJobsBySession(session.id) : [];
  const primaryVideoId = session ? getSessionPrimaryVideoId(session) : null;
  const primaryAnalysis = primaryVideoId
    ? getAnalysis(primaryVideoId)
    : undefined;

  const initialScores = useMemo(() => {
    const base = Object.fromEntries(
      NCS_RUBRIC_ITEMS.map((i) => [i.id, 3]),
    ) as Record<NcsElementId, number>;
    for (const r of primaryAnalysis?.ncsRubric ?? []) {
      base[r.element] = r.score;
    }
    return base;
  }, [primaryAnalysis]);

  const [scores, setScores] = useState(initialScores);
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      (primaryAnalysis?.ncsRubric ?? []).map((r) => [
        r.element,
        r.evidence ?? "",
      ]),
    ),
  );
  const [expertNote, setExpertNote] = useState(
    primaryAnalysis?.manualComment ?? session?.note ?? "",
  );
  const [level, setLevel] = useState<"초급" | "중급" | "고급">(
    session?.skillLevel ?? primaryAnalysis?.skillLevel ?? "중급",
  );
  const [saved, setSaved] = useState(false);

  if (!session) {
    return (
      <AppShell title="숙련도 평가">
        <p className="text-sm text-muted">평가 세션을 찾을 수 없습니다.</p>
        <Link href="/evaluation/" className="mt-2 inline-block text-sm text-brand">
          목록
        </Link>
      </AppShell>
    );
  }

  const ncsAvg =
    Object.values(scores).reduce((a, b) => a + b, 0) / NCS_RUBRIC_ITEMS.length;
  const counts = mediaCounts(session);
  const videos = session.media.filter((m) => m.kind === "video");
  const photos = session.media.filter((m) => m.kind !== "video");

  const relatedEvents = (element: NcsElementId) =>
    (primaryAnalysis?.ncsEvents ?? []).filter((e) => e.ncsHint === element);

  return (
    <AppShell
      title="NCS · 세션 평가"
      subtitle={`${session.regNo} · ${worker?.name ?? session.workerId} · ${session.skill} · ${session.examDate}`}
      actions={
        <div className="flex flex-wrap gap-2">
          {primaryVideoId ? (
            <Link
              href={`/analysis/${primaryVideoId}/`}
              className="rounded-lg border border-line px-3 py-2 text-sm"
            >
              대표 분석
            </Link>
          ) : null}
          <Link
            href={`/workers/${session.workerId}/`}
            className="rounded-lg border border-line px-3 py-2 text-sm"
          >
            기술자
          </Link>
          <Link
            href="/evaluation/"
            className="rounded-lg border border-line px-3 py-2 text-sm"
          >
            목록
          </Link>
        </div>
      }
    >
      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <p>
          이 화면은 <b>영상 1건이 아니라 평가 세션 1건</b>에 대한 NCS·전문가
          확정입니다. 세션 미디어(영상 {counts.videos} · 사진 {counts.products})
          전체가 동일 시험의 근거입니다.
        </p>
        <p className="mt-1 text-xs">
          {session.scenarioId ?? SCENARIO_MOLD.id} · {NCS_MOLD_ASSY.code} ·{" "}
          {NCS_SAFETY.code} · AI 참고 {session.skillScore ?? "—"}점
        </p>
      </div>

      <section className="mb-5 rounded-xl border border-line bg-surface p-4">
        <h2 className="text-sm font-semibold">세션 미디어 근거</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-1 text-[11px] font-medium text-muted">영상</p>
            <ul className="space-y-1 text-xs">
              {videos.map((v) => {
                const job = sessionJobs.find((j) => j.videoId === v.videoId);
                const analysis = v.videoId ? getAnalysis(v.videoId) : undefined;
                return (
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
                      {job ? ` · ${job.status}` : ""}
                    </span>
                    {analysis ? (
                      <Link
                        href={`/analysis/${v.videoId}/`}
                        className="shrink-0 text-brand hover:underline"
                      >
                        분석
                      </Link>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <p className="mb-1 text-[11px] font-medium text-muted">결과물 사진</p>
            {photos.length ? (
              <div className="flex flex-wrap gap-2">
                {photos.map((p) => (
                  <div
                    key={p.id}
                    className="w-16 overflow-hidden rounded border border-line"
                  >
                    {p.src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={asset(p.src)}
                        alt={p.name}
                        className="aspect-square w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-square items-center justify-center bg-bg text-[8px] text-muted">
                        파일
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted">사진 없음</p>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-5">
        <section className="space-y-3 lg:col-span-3">
          <h2 className="text-sm font-semibold">
            NCS 루브릭 (1–5) · 세션 종합
          </h2>
          {NCS_RUBRIC_ITEMS.map((item) => {
            const events = relatedEvents(item.id);
            return (
              <div
                key={item.id}
                className="rounded-xl border border-line bg-surface p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted">
                      {item.code} · {item.stageHint}
                    </p>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted">{item.desc}</p>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={scores[item.id]}
                    onChange={(e) =>
                      setScores((prev) => ({
                        ...prev,
                        [item.id]: Number(e.target.value),
                      }))
                    }
                    className="w-16 rounded-lg border border-line bg-bg px-2 py-1.5 text-center text-sm"
                  />
                </div>
                {events.length ? (
                  <ul className="mt-2 space-y-1 rounded-md bg-bg px-2 py-1.5 text-[11px] text-muted">
                    {events.map((e) => (
                      <li key={e.id}>
                        <span className="font-medium text-ink">
                          {eventMeta(e.type).name}
                        </span>
                        {e.stageId ? ` · ${stageMeta(e.stageId).name}` : ""}
                        {" — "}
                        {e.note}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <label className="mt-2 block text-xs">
                  <span className="mb-1 block text-muted">근거 메모</span>
                  <input
                    value={notes[item.id] ?? ""}
                    onChange={(e) =>
                      setNotes((prev) => ({
                        ...prev,
                        [item.id]: e.target.value,
                      }))
                    }
                    placeholder="세션 내 Stage·Event·영상·사진을 인용"
                    className="w-full rounded-md border border-line bg-bg px-2 py-1.5"
                  />
                </label>
              </div>
            );
          })}
        </section>

        <section className="rounded-xl border border-line bg-surface p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold">전문가 종합 (세션)</h2>
          <p className="mt-2 text-xs text-muted">
            NCS 평균 <b className="text-ink">{ncsAvg.toFixed(1)}</b> / 5
            {session.skillScore != null ? (
              <> · AI 참고 {session.skillScore}</>
            ) : null}
          </p>
          <p className="mt-1 text-[11px] text-muted">
            현재 NCS 상태: {session.ncsReviewStatus ?? "미검토"}
          </p>

          <label className="mt-4 block text-sm">
            <span className="mb-1 block text-xs text-muted">숙련도 등급</span>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as typeof level)}
              className="w-full rounded-lg border border-line bg-bg px-3 py-2"
            >
              <option value="초급">초급 (&lt;65)</option>
              <option value="중급">중급 (65–84)</option>
              <option value="고급">고급 (≥85)</option>
            </select>
          </label>

          <label className="mt-3 block text-sm">
            <span className="mb-1 block text-xs text-muted">전문가 의견</span>
            <textarea
              value={expertNote}
              onChange={(e) => setExpertNote(e.target.value)}
              rows={6}
              placeholder="세션 전체(복수 영상·사진)를 종합한 의견"
              className="w-full resize-none rounded-lg border border-line bg-bg px-3 py-2"
            />
          </label>

          {primaryAnalysis?.ncsStages?.length ? (
            <div className="mt-4 rounded-lg bg-bg p-3 text-[11px] text-muted">
              <p className="font-medium text-ink">대표 영상 Stage</p>
              <ul className="mt-1 space-y-0.5">
                {primaryAnalysis.ncsStages.map((s) => {
                  const m = stageMeta(s.stageId);
                  return (
                    <li key={s.id}>
                      {m.element} {m.name}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setSaved(true)}
            className="mt-4 w-full rounded-lg bg-brand py-2.5 text-sm font-medium text-white"
          >
            세션 NCS 평가 확정
          </button>
          {saved ? (
            <p className="mt-2 text-center text-xs text-ok">
              {session.regNo} 확정 저장됨 (프로토타입)
            </p>
          ) : null}
          <Link
            href={`/reports/${session.id}/`}
            className="mt-3 block text-center text-xs text-brand hover:underline"
          >
            세션 평가서
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
