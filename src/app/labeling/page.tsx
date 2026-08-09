"use client";

import { useMemo, useState } from "react";
import { jobs, workers } from "@/data/mock";

type SegType = "정상" | "이상" | "정지" | "검토필요";

type Segment = {
  id: string;
  start: number;
  end: number;
  type: SegType;
  note: string;
};

const TYPE_STYLE: Record<SegType, string> = {
  정상: "bg-emerald-500",
  이상: "bg-amber-500",
  정지: "bg-slate-400",
  검토필요: "bg-danger",
};

function fmt(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function TimelineLabelingPage() {
  const sample = jobs.find((j) => j.videoId === "V-101") ?? jobs[0]!;
  const worker = workers.find((w) => w.id === sample.workerId);
  const duration = sample.durationSec;
  const [t, setT] = useState(42);
  const [playing, setPlaying] = useState(false);
  const [segType, setSegType] = useState<SegType>("이상");
  const [note, setNote] = useState("");
  const [markStart, setMarkStart] = useState<number | null>(42);
  const [segments, setSegments] = useState<Segment[]>([
    {
      id: "s1",
      start: 30,
      end: 55,
      type: "정지",
      note: "Idle 구간 (AI 제안)",
    },
    {
      id: "s2",
      start: 110,
      end: 125,
      type: "이상",
      note: "불필요 손동작 (AI 제안)",
    },
  ]);

  const progress = useMemo(
    () => Math.min(100, (t / duration) * 100),
    [t, duration],
  );

  function addSegment() {
    if (markStart == null) {
      setMarkStart(t);
      return;
    }
    const start = Math.min(markStart, t);
    const end = Math.max(markStart, t);
    if (end - start < 1) {
      alert("구간이 너무 짧습니다.");
      return;
    }
    setSegments((prev) => [
      ...prev,
      {
        id: `s-${Date.now()}`,
        start,
        end,
        type: segType,
        note: note || `${segType} 구간`,
      },
    ]);
    setMarkStart(null);
    setNote("");
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        영상 재생 시간 축에 <b className="font-medium text-ink">이상행동·정지</b> 등
        구간을 라벨링합니다. AI 제안 구간을 확인하고 보정합니다.
      </p>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label>
          <span className="mr-2 text-xs text-muted">대상 영상</span>
          <select
            className="rounded-lg border border-line bg-surface px-3 py-1.5"
            defaultValue={sample.videoId}
          >
            {jobs.map((j) => {
              const w = workers.find((x) => x.id === j.workerId);
              return (
                <option key={j.id} value={j.videoId}>
                  {j.videoId} · {w?.name}
                </option>
              );
            })}
          </select>
        </label>
        <span className="text-xs text-muted">
          {worker?.name} · {sample.jobType} · {fmt(duration)}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="rounded-xl border border-line bg-surface p-4 lg:col-span-3">
          <div className="flex aspect-video items-center justify-center rounded-lg bg-slate-900 text-sm text-slate-300">
            영상 플레이어 (프로토타입)
            <span className="ml-2 font-mono text-brand">{fmt(t)}</span>
          </div>

          <div className="mt-4 space-y-2">
            <input
              type="range"
              min={0}
              max={duration}
              value={t}
              onChange={(e) => setT(Number(e.target.value))}
              className="w-full accent-brand"
            />
            <div className="relative h-8 overflow-hidden rounded-md bg-bg">
              {segments.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  title={`${s.note} (${fmt(s.start)}–${fmt(s.end)})`}
                  className={`absolute top-1 bottom-1 rounded-sm opacity-80 ${TYPE_STYLE[s.type]}`}
                  style={{
                    left: `${(s.start / duration) * 100}%`,
                    width: `${((s.end - s.start) / duration) * 100}%`,
                  }}
                  onClick={() => setT(s.start)}
                />
              ))}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-brand"
                style={{ left: `${progress}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] text-muted">
              {(Object.keys(TYPE_STYLE) as SegType[]).map((k) => (
                <span key={k} className="inline-flex items-center gap-1">
                  <i className={`inline-block h-2 w-2 rounded-sm ${TYPE_STYLE[k]}`} />
                  {k}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="rounded-md border border-line px-3 py-1.5 text-sm"
            >
              {playing ? "일시정지" : "재생"}
            </button>
            <button
              type="button"
              onClick={() => setT((x) => Math.max(0, x - 5))}
              className="rounded-md border border-line px-3 py-1.5 text-sm"
            >
              -5초
            </button>
            <button
              type="button"
              onClick={() => setT((x) => Math.min(duration, x + 5))}
              className="rounded-md border border-line px-3 py-1.5 text-sm"
            >
              +5초
            </button>
            <button
              type="button"
              onClick={() => setMarkStart(t)}
              className="rounded-md border border-line px-3 py-1.5 text-sm"
            >
              시작 마크 {markStart != null ? `(${fmt(markStart)})` : ""}
            </button>
            <button
              type="button"
              onClick={addSegment}
              className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white"
            >
              {markStart == null ? "구간 시작" : "구간 종료·저장"}
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-line bg-surface p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold">구간 라벨</h2>
          <label className="mt-3 block text-sm">
            <span className="mb-1 block text-xs text-muted">유형</span>
            <select
              value={segType}
              onChange={(e) => setSegType(e.target.value as SegType)}
              className="w-full rounded-lg border border-line bg-bg px-3 py-2"
            >
              {(Object.keys(TYPE_STYLE) as SegType[]).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3 block text-sm">
            <span className="mb-1 block text-xs text-muted">메모</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-line bg-bg px-3 py-2"
              placeholder="이상행동 설명"
            />
          </label>

          <ul className="mt-4 max-h-72 space-y-2 overflow-y-auto">
            {segments
              .slice()
              .sort((a, b) => a.start - b.start)
              .map((s) => (
                <li
                  key={s.id}
                  className="rounded-lg border border-line bg-bg px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{s.type}</span>
                    <span className="font-mono text-[11px] text-muted">
                      {fmt(s.start)}–{fmt(s.end)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{s.note}</p>
                  <button
                    type="button"
                    className="mt-1 text-[11px] text-danger hover:underline"
                    onClick={() =>
                      setSegments((prev) => prev.filter((x) => x.id !== s.id))
                    }
                  >
                    삭제
                  </button>
                </li>
              ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
