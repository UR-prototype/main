"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { getAnalysis, getJob, getWorker } from "@/data/mock";
import {
  NCS_MOLD_ASSY,
  NCS_RUBRIC_ITEMS,
  NCS_SAFETY,
  SCENARIO_MOLD,
  eventMeta,
  stageMeta,
  type NcsElementId,
} from "@/data/ncs";

export default function EvaluationClient() {
  const { id } = useParams<{ id: string }>();
  const job = getJob(id);
  const analysis = getAnalysis(id);
  const worker = job ? getWorker(job.workerId) : undefined;

  const initialScores = useMemo(() => {
    const base = Object.fromEntries(
      NCS_RUBRIC_ITEMS.map((i) => [i.id, 3]),
    ) as Record<NcsElementId, number>;
    for (const r of analysis?.ncsRubric ?? []) {
      base[r.element] = r.score;
    }
    return base;
  }, [analysis]);

  const [scores, setScores] = useState(initialScores);
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      (analysis?.ncsRubric ?? []).map((r) => [r.element, r.evidence ?? ""]),
    ),
  );
  const [expertNote, setExpertNote] = useState(
    analysis?.manualComment ?? "",
  );
  const [level, setLevel] = useState<"초급" | "중급" | "고급">(
    analysis?.skillLevel ?? "중급",
  );
  const [saved, setSaved] = useState(false);

  if (!job) {
    return (
      <AppShell title="숙련도 평가">
        <p className="text-sm text-muted">대상을 찾을 수 없습니다.</p>
      </AppShell>
    );
  }

  const ncsAvg =
    Object.values(scores).reduce((a, b) => a + b, 0) / NCS_RUBRIC_ITEMS.length;

  const relatedEvents = (element: NcsElementId) =>
    (analysis?.ncsEvents ?? []).filter((e) => e.ncsHint === element);

  return (
    <AppShell
      title="NCS · 전문가 평가"
      subtitle={`${worker?.name ?? job.workerId} · ${job.videoId} · ${job.jobType}`}
      actions={
        <div className="flex gap-2">
          <Link
            href={`/analysis/${id}/`}
            className="rounded-lg border border-line px-3 py-2 text-sm"
          >
            AI·라벨 참고
          </Link>
          <Link
            href="/labeling/"
            className="rounded-lg border border-line px-3 py-2 text-sm"
          >
            타임라인
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
          숙련도 확정은 <b>NCS 수행준거 + 전문가</b> 기준입니다. AI 점수(
          {analysis?.skillScore ?? "—"})·Event는 <b>참고·근거</b>이며 Event 하나가
          곧바로 요소 미달이 아닙니다.
        </p>
        <p className="mt-1 text-xs">
          {NCS_MOLD_ASSY.code} {NCS_MOLD_ASSY.title} · {NCS_SAFETY.code} ·{" "}
          {analysis?.scenarioId ?? SCENARIO_MOLD.id}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <section className="space-y-3 lg:col-span-3">
          <h2 className="text-sm font-semibold">
            NCS 루브릭 (1–5) · 역할: 평가자
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
                    placeholder="Stage·Event·시각을 남김"
                    className="w-full rounded-md border border-line bg-bg px-2 py-1.5"
                  />
                </label>
              </div>
            );
          })}
        </section>

        <section className="rounded-xl border border-line bg-surface p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold">전문가 종합</h2>
          <p className="mt-2 text-xs text-muted">
            NCS 평균 <b className="text-ink">{ncsAvg.toFixed(1)}</b> / 5
            {analysis ? (
              <>
                {" "}
                · AI {analysis.skillScore} · 평가자 참고{" "}
                {analysis.manualScore}
              </>
            ) : null}
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
              placeholder="공정 준수, 개선 포인트, 배치 권고"
              className="w-full resize-none rounded-lg border border-line bg-bg px-3 py-2"
            />
          </label>

          {analysis?.ncsStages?.length ? (
            <div className="mt-4 rounded-lg bg-bg p-3 text-[11px] text-muted">
              <p className="font-medium text-ink">관측 Stage</p>
              <ul className="mt-1 space-y-0.5">
                {analysis.ncsStages.map((s) => {
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
            NCS 평가 확정
          </button>
          {saved ? (
            <p className="mt-2 text-center text-xs text-ok">
              저장되었습니다. (프로토타입)
            </p>
          ) : null}
          <Link
            href={`/reports/${id}/`}
            className="mt-3 block text-center text-xs text-brand hover:underline"
          >
            평가서 보기
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
