"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { FrameRail } from "@/components/FrameRail";
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
  NCS_STAGES,
  SCENARIO_MOLD,
  eventMeta,
  stageMeta,
  type NcsElementId,
} from "@/data/ncs";
import { formatDuration } from "@/lib/status";

function stageHintLabel(hint: string) {
  const stage = NCS_STAGES.find((s) => s.id === hint || hint.includes(s.id));
  if (stage) return stage.name;
  if (hint.includes("PRODUCT")) return "확인 단계 · 결과물";
  if (hint.includes("SAFETY") || hint.includes("CLOSE")) return "안전·마무리";
  return hint;
}

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
  const scenarioTitle =
    session.scenarioId === SCENARIO_MOLD.id || !session.scenarioId
      ? SCENARIO_MOLD.title
      : session.scenarioId;

  const relatedEvents = (element: NcsElementId) =>
    (primaryAnalysis?.ncsEvents ?? []).filter((e) => e.ncsHint === element);

  return (
    <AppShell
      title="숙련도 평가"
      subtitle={`${session.regNo} · ${worker?.name ?? session.workerId} · ${session.skill} · ${session.examDate}`}
      actions={
        <div className="flex flex-wrap gap-2">
          {primaryVideoId ? (
            <Link
              href={`/analysis/${primaryVideoId}/`}
              className="rounded-lg border border-line px-3 py-2 text-sm"
            >
              AI 분석 상세
            </Link>
          ) : null}
          {primaryVideoId ? (
            <Link
              href={`/labeling/?session=${session.id}&video=${primaryVideoId}`}
              className="rounded-lg border border-line px-3 py-2 text-sm"
            >
              타임라인 라벨
            </Link>
          ) : null}
          <Link
            href="/evaluation/"
            className="rounded-lg border border-line px-3 py-2 text-sm"
          >
            목록
          </Link>
        </div>
      }
    >
      <div className="mb-4 rounded-xl border border-line bg-surface px-4 py-3 text-sm">
        <p className="font-medium text-ink">무엇을 평가하나요?</p>
        <p className="mt-1 text-muted">
          이 화면은{" "}
          <b className="font-medium text-ink">NCS 능력단위</b>를 기준으로,
          전문가가 세션 전체 근거를 보고 숙련도를{" "}
          <b className="font-medium text-ink">최종 확정</b>하는 곳입니다. AI
          점수·Stage/Event는 자동 판정이 아니라 참고 근거입니다.
        </p>
        <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
          <div className="rounded-md bg-bg px-3 py-2">
            <dt className="text-muted">평가 단위</dt>
            <dd className="mt-0.5 font-medium text-ink">
              세션 1건 ({session.regNo})
            </dd>
            <dd className="text-muted">
              영상 {counts.videos} · 사진 {counts.products} — 같은 시험의 근거
            </dd>
          </div>
          <div className="rounded-md bg-bg px-3 py-2">
            <dt className="text-muted">평가 기준 (NCS)</dt>
            <dd className="mt-0.5 font-medium text-ink">
              {NCS_MOLD_ASSY.title}
            </dd>
            <dd className="text-muted">
              + {NCS_SAFETY.title} · E1–E4 · SAFE 루브릭
            </dd>
          </div>
          <div className="rounded-md bg-bg px-3 py-2">
            <dt className="text-muted">시험 시나리오</dt>
            <dd className="mt-0.5 font-medium text-ink">{scenarioTitle}</dd>
          </div>
          <div className="rounded-md bg-bg px-3 py-2">
            <dt className="text-muted">AI 참고 점수</dt>
            <dd className="mt-0.5 font-medium text-ink">
              {session.skillScore != null ? `${session.skillScore}점` : "—"}
              {session.skillLevel ? ` · 제안 ${session.skillLevel}` : ""}
            </dd>
            <dd className="text-muted">확정값은 오른쪽 전문가 종합에서 결정</dd>
          </div>
        </dl>
      </div>

      <section className="mb-5 rounded-xl border border-line bg-surface p-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold">시험 근거 미디어</h2>
            <p className="mt-0.5 text-xs text-muted">
              라벨링으로 Stage/Event를 다듬고, AI 분석에서 상세 재생·근거 프레임을
              확인한 뒤 아래에서 NCS 점수를 확정합니다.
            </p>
          </div>
        </div>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-1 text-[11px] font-medium text-muted">영상</p>
            <ul className="space-y-1.5 text-xs">
              {videos.map((v) => {
                const job = sessionJobs.find((j) => j.videoId === v.videoId);
                const analysis = v.videoId ? getAnalysis(v.videoId) : undefined;
                return (
                  <li
                    key={v.id}
                    className="rounded-md bg-bg px-2.5 py-2"
                  >
                    <p className="truncate font-medium text-ink">{v.name}</p>
                    <p className="text-muted">
                      {v.videoId ?? "—"}
                      {v.durationSec != null
                        ? ` · ${formatDuration(v.durationSec)}`
                        : ""}
                      {job ? ` · ${job.status}` : ""}
                      {analysis?.skillScore != null
                        ? ` · AI ${analysis.skillScore}점`
                        : ""}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {v.videoId && analysis ? (
                        <Link
                          href={`/analysis/${v.videoId}/`}
                          className="font-medium text-brand hover:underline"
                        >
                          AI 분석·재생
                        </Link>
                      ) : null}
                      {v.videoId ? (
                        <Link
                          href={`/labeling/?session=${session.id}&video=${v.videoId}`}
                          className="text-brand hover:underline"
                        >
                          타임라인 라벨
                        </Link>
                      ) : null}
                      {v.videoId && analysis ? (
                        <Link
                          href={`/analysis/${v.videoId}/review/`}
                          className="text-muted hover:underline"
                        >
                          검수
                        </Link>
                      ) : null}
                    </div>
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
                  <Link
                    key={p.id}
                    href={`/labeling/product/?session=${session.id}&media=${p.id}`}
                    className="w-16 overflow-hidden rounded border border-line hover:border-brand"
                    title={`${p.name} · 좌표 라벨`}
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
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted">사진 없음</p>
            )}
            {photos.length ? (
              <p className="mt-2 text-[11px] text-muted">
                사진을 누르면 조형물 좌표 라벨링으로 이동합니다.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {primaryAnalysis?.evidenceFrames?.length ? (
        <div className="mb-5">
          <FrameRail
            frames={primaryAnalysis.evidenceFrames}
            title={`AI 근거 프레임 · ${primaryVideoId}`}
          />
          <p className="mt-2 text-xs text-muted">
            프레임만으로는 재생이 부족하면{" "}
            <Link
              href={`/analysis/${primaryVideoId}/`}
              className="text-brand hover:underline"
            >
              AI 분석 상세
            </Link>
            에서 타임라인·포즈·점수 분해를 확인하세요.
          </p>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-5">
        <section className="space-y-3 lg:col-span-3">
          <h2 className="text-sm font-semibold">
            NCS 루브릭 (1–5) · 세션 종합
          </h2>
          <p className="text-xs text-muted">
            {NCS_MOLD_ASSY.title} 능력요소 E1–E4와 {NCS_SAFETY.title}(SAFE).
            AI가 제안한 점수·이벤트를 보고 전문가가 수정합니다.
          </p>
          {NCS_RUBRIC_ITEMS.map((item) => {
            const events = relatedEvents(item.id);
            const aiScore = primaryAnalysis?.ncsRubric?.find(
              (r) => r.element === item.id,
            )?.score;
            return (
              <div
                key={item.id}
                className="rounded-xl border border-line bg-surface p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted">
                      {item.code} · {stageHintLabel(item.stageHint)}
                      {aiScore != null ? ` · AI 제안 ${aiScore}` : ""}
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
                    aria-label={`${item.title} 점수`}
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
                    placeholder="Stage·Event·영상·사진을 인용"
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
              <> · AI 참고 {session.skillScore}점</>
            ) : null}
          </p>
          <p className="mt-1 text-[11px] text-muted">
            검토 상태: {session.ncsReviewStatus ?? "미검토"}
          </p>

          <label className="mt-4 block text-sm">
            <span className="mb-1 block text-xs text-muted">숙련도 등급 (확정)</span>
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
              <p className="font-medium text-ink">
                대표 영상 Stage (AI/라벨)
              </p>
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
            NCS 숙련도 확정
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
