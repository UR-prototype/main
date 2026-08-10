"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { analyses, getJob, getSession, getWorker, jobs } from "@/data/mock";
import {
  NCS_STAGES,
  NCS_EVENTS,
  eventMeta,
  stageMeta,
  type NcsEventType,
  type NcsStageId,
} from "@/data/ncs";
import { asset } from "@/lib/asset";

type IntervalKind = "stage" | "anomaly";

type StageSeg = {
  id: string;
  stageId: NcsStageId;
  name: string;
  start: number;
  end: number;
  color: string;
  note: string;
};

type AnomalySeg = {
  id: string;
  type: NcsEventType;
  name: string;
  start: number;
  end: number;
  note: string;
};

function fmt(t: number) {
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function nearestFrame<T extends { t: number }>(frames: T[], t: number) {
  if (!frames.length) return null;
  return frames.reduce((best, f) =>
    Math.abs(f.t - t) < Math.abs(best.t - t) ? f : best,
  );
}

function sparkPath(values: number[], w: number, h: number) {
  if (!values.length) return "";
  return values
    .map((v, i) => {
      const x = (i / Math.max(1, values.length - 1)) * w;
      const y = h - v * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function TimelineLabelingInner() {
  const search = useSearchParams();
  const qVideo = search.get("video");
  const qSession = search.get("session");

  const completed = useMemo(
    () => jobs.filter((j) => j.status === "completed"),
    [],
  );
  const [videoId, setVideoId] = useState(
    qVideo ??
      completed.find((j) => j.videoId === "V-101")?.videoId ??
      completed[0]?.videoId ??
      "V-101",
  );

  useEffect(() => {
    if (qVideo) setVideoId(qVideo);
  }, [qVideo]);

  const job = getJob(videoId) ?? jobs[0]!;
  const session =
    (qSession ? getSession(qSession) : null) ??
    (job.sessionId ? getSession(job.sessionId) : undefined);
  const worker = getWorker(job.workerId);
  const analysis = analyses[job.videoId];
  const frames = analysis?.evidenceFrames ?? [];
  const duration = 347;

  const [t, setT] = useState(83);
  const [playing, setPlaying] = useState(false);
  const [showAiTrack, setShowAiTrack] = useState(true);
  const [showPose, setShowPose] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [savedFlash, setSavedFlash] = useState(false);
  const [leftTab, setLeftTab] = useState<"objects" | "labels">("objects");

  const [stages, setStages] = useState<StageSeg[]>(() => {
    const fromMock = analyses["V-101"]?.ncsStages;
    if (fromMock?.length) {
      return fromMock.map((s) => {
        const m = stageMeta(s.stageId);
        return {
          id: s.id,
          stageId: s.stageId,
          name: m.name,
          start: s.start,
          end: s.end,
          color: m.color,
          note: s.note ?? m.hint,
        };
      });
    }
    return NCS_STAGES.map((m, i) => ({
      id: `st${i + 1}`,
      stageId: m.id,
      name: m.name,
      start: i * 60,
      end: Math.min(347, (i + 1) * 60 + 20),
      color: m.color,
      note: m.hint,
    }));
  });

  const [anomalies, setAnomalies] = useState<AnomalySeg[]>(() => {
    const fromMock = analyses["V-101"]?.ncsEvents;
    if (fromMock?.length) {
      return fromMock.map((e) => ({
        id: e.id,
        type: e.type,
        name: eventMeta(e.type).name,
        start: e.start,
        end: e.end,
        note: e.note,
      }));
    }
    return [];
  });

  const [selected, setSelected] = useState<{
    kind: IntervalKind;
    id: string;
  } | null>({ kind: "anomaly", id: "ne2" });

  const [draft, setDraft] = useState({
    kind: "anomaly" as IntervalKind,
    name: "작업순서 오류",
    stageId: "STAGE_FIXED_ASSY" as NcsStageId,
    eventType: "EVENT_WRONG_SEQUENCE" as NcsEventType,
    start: 72,
    end: 88,
    note: "체결 전 확인 생략 · E2 미달 후보",
  });

  const jobIndex = completed.findIndex((j) => j.videoId === videoId);
  const progress = Math.min(100, (t / duration) * 100);
  const frame = nearestFrame(frames, t);
  const poseSrc = frame
    ? asset(
        frame.src.replace(
          `/evidence/${job.videoId}/`,
          `/evidence/pose/${job.videoId}-`,
        ),
      )
    : null;
  const cleanSrc = frame ? asset(frame.src) : null;

  const personSeries = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => {
        const x = i / 47;
        const dip = Math.abs(x - 0.22) < 0.04 ? 0.35 : 0;
        return Math.min(1, 0.88 + Math.sin(i * 0.55) * 0.06 - dip);
      }),
    [],
  );
  const poseSeries = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => {
        const x = i / 47;
        const dip = Math.abs(x - 0.55) < 0.05 ? 0.28 : 0;
        return Math.min(1, 0.82 + Math.cos(i * 0.4) * 0.08 - dip);
      }),
    [],
  );

  function syncVideo(id: string) {
    setVideoId(id);
    setT(0);
    setSelected(null);
    const j = getJob(id);
    const url = new URL(window.location.href);
    if (j?.sessionId) url.searchParams.set("session", j.sessionId);
    url.searchParams.set("video", id);
    window.history.replaceState({}, "", url.pathname + url.search);
  }

  function selectStage(s: StageSeg) {
    setSelected({ kind: "stage", id: s.id });
    setDraft({
      kind: "stage",
      name: s.name,
      stageId: s.stageId,
      eventType: "EVENT_IDLE",
      start: s.start,
      end: s.end,
      note: s.note,
    });
    setT(s.start);
    setLeftTab("objects");
  }

  function selectAnomaly(a: AnomalySeg) {
    setSelected({ kind: "anomaly", id: a.id });
    setDraft({
      kind: "anomaly",
      name: a.name,
      stageId: "STAGE_FIXED_ASSY",
      eventType: a.type,
      start: a.start,
      end: a.end,
      note: a.note,
    });
    setT(a.start);
    setLeftTab("objects");
  }

  function saveDraft() {
    const start = Math.min(draft.start, draft.end);
    const end = Math.max(draft.start, draft.end);
    if (end - start < 1) {
      alert("구간이 너무 짧습니다.");
      return;
    }
    if (draft.kind === "stage") {
      const meta = stageMeta(draft.stageId);
      if (selected?.kind === "stage") {
        setStages((prev) =>
          prev.map((s) =>
            s.id === selected.id
              ? {
                  ...s,
                  stageId: draft.stageId,
                  name: meta.name,
                  start,
                  end,
                  color: meta.color,
                  note: draft.note,
                }
              : s,
          ),
        );
      } else {
        const id = `st-${Date.now()}`;
        setStages((prev) => [
          ...prev,
          {
            id,
            stageId: draft.stageId,
            name: meta.name,
            start,
            end,
            color: meta.color,
            note: draft.note,
          },
        ]);
        setSelected({ kind: "stage", id });
      }
    } else {
      const meta = eventMeta(draft.eventType);
      if (selected?.kind === "anomaly") {
        setAnomalies((prev) =>
          prev.map((a) =>
            a.id === selected.id
              ? {
                  ...a,
                  type: draft.eventType,
                  name: meta.name,
                  start,
                  end,
                  note: draft.note,
                }
              : a,
          ),
        );
      } else {
        const id = `an-${Date.now()}`;
        setAnomalies((prev) => [
          ...prev,
          {
            id,
            type: draft.eventType,
            name: meta.name,
            start,
            end,
            note: draft.note,
          },
        ]);
        setSelected({ kind: "anomaly", id });
      }
    }
  }

  function deleteSelected() {
    if (!selected) return;
    if (selected.kind === "stage") {
      setStages((prev) => prev.filter((s) => s.id !== selected.id));
    } else {
      setAnomalies((prev) => prev.filter((a) => a.id !== selected.id));
    }
    setSelected(null);
  }

  function addStage(stageId?: NcsStageId) {
    const start = t;
    const end = Math.min(duration, start + 30);
    const id = stageId ?? "STAGE_CONFIRM";
    const meta = stageMeta(id);
    setDraft({
      kind: "stage",
      name: meta.name,
      stageId: id,
      eventType: "EVENT_IDLE",
      start,
      end,
      note: meta.hint,
    });
    setSelected(null);
    setLeftTab("objects");
  }

  function addAnomaly(eventType?: NcsEventType) {
    const type = eventType ?? "EVENT_IDLE";
    setDraft({
      kind: "anomaly",
      name: eventMeta(type).name,
      stageId: "STAGE_FIXED_ASSY",
      eventType: type,
      start: Math.max(0, t - 5),
      end: Math.min(duration, t + 10),
      note: "",
    });
    setSelected(null);
    setLeftTab("objects");
  }

  function goVideo(dir: -1 | 1) {
    if (!completed.length) return;
    const next =
      completed[(jobIndex + dir + completed.length) % completed.length]!;
    syncVideo(next.videoId);
  }

  function finishSave() {
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1600);
  }

  const ticks = [0, 60, 120, 180, 240, 300, 347];
  const panelBtn =
    "h-7 rounded border border-line bg-surface px-2 text-[11px] hover:bg-bg disabled:opacity-40";

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#1e1e22] text-[12px] text-slate-200">
      {/* Toolbar */}
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-white/10 bg-[#2a2a30] px-2">
        <button type="button" onClick={() => goVideo(-1)} className={panelBtn}>
          <ChevronLeft size={14} />
        </button>
        <button type="button" onClick={() => goVideo(1)} className={panelBtn}>
          <ChevronRight size={14} />
        </button>
        <select
          value={videoId}
          onChange={(e) => syncVideo(e.target.value)}
          className="h-7 max-w-[14rem] truncate rounded border border-white/15 bg-[#1e1e22] px-2 text-[11px]"
        >
          {completed.map((j) => (
            <option key={j.videoId} value={j.videoId}>
              {j.videoId} · {j.videoName}
            </option>
          ))}
        </select>
        <span className="hidden truncate text-[11px] text-slate-400 sm:inline">
          {worker?.name ?? job.workerId}
          {session ? ` · ${session.regNo}` : ""}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <label className="inline-flex items-center gap-1 text-[11px] text-slate-400">
            <input
              type="checkbox"
              checked={showPose}
              onChange={(e) => setShowPose(e.target.checked)}
              className="accent-brand"
            />
            Pose
          </label>
          <label className="inline-flex items-center gap-1 text-[11px] text-slate-400">
            <input
              type="checkbox"
              checked={showAiTrack}
              onChange={(e) => setShowAiTrack(e.target.checked)}
              className="accent-brand"
            />
            AI track
          </label>
          <button
            type="button"
            onClick={finishSave}
            className="inline-flex h-7 items-center gap-1 rounded bg-brand px-2.5 text-[11px] font-medium text-white"
          >
            <Save size={12} />
            {savedFlash ? "저장됨" : "저장"}
          </button>
        </div>
      </div>

      {/* Workspace */}
      <div className="flex min-h-0 flex-1">
        {/* Left: objects / label palette */}
        <aside className="flex w-52 shrink-0 flex-col border-r border-white/10 bg-[#25252b]">
          <div className="flex h-8 shrink-0 border-b border-white/10">
            {(
              [
                ["objects", "객체"],
                ["labels", "라벨"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setLeftTab(id)}
                className={`flex-1 text-[11px] font-medium ${
                  leftTab === id
                    ? "border-b-2 border-brand text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
            {leftTab === "objects" ? (
              <div className="space-y-2">
                <div>
                  <div className="mb-1 flex items-center justify-between px-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Stage ({stages.length})
                    </p>
                    <button
                      type="button"
                      onClick={() => addStage()}
                      className="text-brand hover:underline"
                      title="현재 시각에 Stage 추가"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <ul className="space-y-0.5">
                    {stages.map((s, i) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => selectStage(s)}
                          className={`flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left ${
                            selected?.kind === "stage" && selected.id === s.id
                              ? "bg-brand/25 text-white"
                              : "hover:bg-white/5"
                          }`}
                        >
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-sm"
                            style={{ background: s.color }}
                          />
                          <span className="min-w-0 flex-1 truncate">
                            {i + 1}. {s.name}
                          </span>
                          <span className="shrink-0 font-mono text-[9px] text-slate-500">
                            {fmt(s.start)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between px-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Event ({anomalies.length})
                    </p>
                    <button
                      type="button"
                      onClick={() => addAnomaly()}
                      className="text-brand hover:underline"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <ul className="space-y-0.5">
                    {anomalies.map((a) => (
                      <li key={a.id}>
                        <button
                          type="button"
                          onClick={() => selectAnomaly(a)}
                          className={`flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left ${
                            selected?.kind === "anomaly" && selected.id === a.id
                              ? "bg-red-500/20 text-white"
                              : "hover:bg-white/5"
                          }`}
                        >
                          <AlertTriangle
                            size={11}
                            className="shrink-0 text-red-400"
                          />
                          <span className="min-w-0 flex-1 truncate">
                            {a.name}
                          </span>
                          <span className="shrink-0 font-mono text-[9px] text-slate-500">
                            {fmt(a.start)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="px-1 text-[10px] text-slate-500">
                  클릭 시 현재 재생 위치에 구간을 만듭니다.
                </p>
                <div>
                  <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    NCS Stage
                  </p>
                  <ul className="space-y-0.5">
                    {NCS_STAGES.map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => addStage(s.id)}
                          className="flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left hover:bg-white/5"
                        >
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-sm"
                            style={{ background: s.color }}
                          />
                          <span className="truncate">
                            {s.element} · {s.name}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Event
                  </p>
                  <ul className="space-y-0.5">
                    {NCS_EVENTS.map((e) => (
                      <li key={e.type}>
                        <button
                          type="button"
                          onClick={() => addAnomaly(e.type)}
                          className="flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left hover:bg-white/5"
                        >
                          <AlertTriangle
                            size={11}
                            className="shrink-0 text-red-400"
                          />
                          <span className="truncate">{e.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Center canvas */}
        <section className="flex min-w-0 flex-1 flex-col bg-black">
          <div className="relative min-h-0 flex-1">
            {cleanSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={showPose && poseSrc ? poseSrc : cleanSrc}
                alt=""
                className="absolute inset-0 h-full w-full object-contain"
                onError={(e) => {
                  if (cleanSrc) e.currentTarget.src = cleanSrc;
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500">
                프레임 없음
              </div>
            )}
            {showPose ? (
              <>
                <div className="absolute left-[18%] top-[12%] h-[72%] w-[28%] rounded border-2 border-emerald-400/90">
                  <span className="absolute -top-5 left-0 rounded bg-emerald-500 px-1 py-0.5 text-[10px] font-medium text-white">
                    person 0.98
                  </span>
                </div>
                <svg
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <polyline
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="0.55"
                    points="32,22 32,38 28,52 26,68 30,82 38,82 36,68 34,52 40,38 48,38 52,52 54,68 50,82 58,82 56,68 54,52 48,38 40,22 32,22"
                  />
                  <circle cx="36" cy="18" r="2" fill="#34d399" />
                </svg>
              </>
            ) : null}
            {frame ? (
              <div className="absolute bottom-2 left-2 max-w-[70%] rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">
                {frame.title} · {fmt(frame.t)}
              </div>
            ) : null}
          </div>
          <div className="flex h-9 shrink-0 items-center gap-2 border-t border-white/10 bg-[#2a2a30] px-2">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="inline-flex h-7 w-7 items-center justify-center rounded border border-white/15 hover:bg-white/5"
              aria-label={playing ? "일시정지" : "재생"}
            >
              {playing ? <Pause size={13} /> : <Play size={13} />}
            </button>
            <button
              type="button"
              onClick={() => setT((x) => Math.max(0, x - 5))}
              className={panelBtn}
            >
              −5s
            </button>
            <button
              type="button"
              onClick={() => setT((x) => Math.min(duration, x + 5))}
              className={panelBtn}
            >
              +5s
            </button>
            <span className="font-mono tabular-nums text-[11px]">
              {fmt(t)} / {fmt(duration)}
            </span>
            <input
              type="range"
              min={0}
              max={duration}
              value={t}
              onChange={(e) => setT(Number(e.target.value))}
              className="mx-1 min-w-0 flex-1 accent-brand"
            />
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="h-7 rounded border border-white/15 bg-[#1e1e22] px-1.5 text-[11px]"
            >
              {[0.5, 1, 1.5, 2].map((s) => (
                <option key={s} value={s}>
                  {s.toFixed(1)}x
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Right: attributes */}
        <aside className="flex w-60 shrink-0 flex-col border-l border-white/10 bg-[#25252b]">
          <div className="flex h-8 shrink-0 items-center border-b border-white/10 px-2 text-[11px] font-semibold text-slate-300">
            속성
          </div>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
            <div className="flex gap-1">
              {(
                [
                  ["stage", "Stage"],
                  ["anomaly", "Event"],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, kind: k }))}
                  className={`h-7 flex-1 rounded text-[11px] font-medium ${
                    draft.kind === k
                      ? "bg-brand text-white"
                      : "border border-white/15 text-slate-400 hover:bg-white/5"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {draft.kind === "stage" ? (
              <label className="block">
                <span className="mb-0.5 block text-[10px] text-slate-500">
                  NCS Stage
                </span>
                <select
                  value={draft.stageId}
                  onChange={(e) => {
                    const stageId = e.target.value as NcsStageId;
                    const m = stageMeta(stageId);
                    setDraft((d) => ({
                      ...d,
                      stageId,
                      name: m.name,
                      note: d.note || m.hint,
                    }));
                  }}
                  className="h-8 w-full rounded border border-white/15 bg-[#1e1e22] px-2 text-[11px]"
                >
                  {NCS_STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.element} · {s.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label className="block">
                <span className="mb-0.5 block text-[10px] text-slate-500">
                  Event 유형
                </span>
                <select
                  value={draft.eventType}
                  onChange={(e) => {
                    const eventType = e.target.value as NcsEventType;
                    setDraft((d) => ({
                      ...d,
                      eventType,
                      name: eventMeta(eventType).name,
                    }));
                  }}
                  className="h-8 w-full rounded border border-white/15 bg-[#1e1e22] px-2 text-[11px]"
                >
                  {NCS_EVENTS.map((e) => (
                    <option key={e.type} value={e.type}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="grid grid-cols-2 gap-1.5">
              <label className="block">
                <span className="mb-0.5 block text-[10px] text-slate-500">
                  시작(초)
                </span>
                <input
                  type="number"
                  min={0}
                  max={duration}
                  value={draft.start}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, start: Number(e.target.value) }))
                  }
                  className="h-8 w-full rounded border border-white/15 bg-[#1e1e22] px-2 font-mono text-[11px]"
                />
              </label>
              <label className="block">
                <span className="mb-0.5 block text-[10px] text-slate-500">
                  종료(초)
                </span>
                <input
                  type="number"
                  min={0}
                  max={duration}
                  value={draft.end}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, end: Number(e.target.value) }))
                  }
                  className="h-8 w-full rounded border border-white/15 bg-[#1e1e22] px-2 font-mono text-[11px]"
                />
              </label>
            </div>
            <p className="text-[10px] text-slate-500">
              길이 {fmt(Math.abs(draft.end - draft.start))}
              {draft.kind === "anomaly" ? (
                <span> · {eventMeta(draft.eventType).role}</span>
              ) : null}
            </p>
            <label className="block">
              <span className="mb-0.5 block text-[10px] text-slate-500">설명</span>
              <textarea
                rows={3}
                value={draft.note}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, note: e.target.value }))
                }
                className="w-full resize-none rounded border border-white/15 bg-[#1e1e22] px-2 py-1.5 text-[11px]"
              />
            </label>
            <div className="flex gap-1.5 pt-1">
              <button
                type="button"
                onClick={deleteSelected}
                disabled={!selected}
                className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded border border-white/15 text-red-300 disabled:opacity-40"
              >
                <Trash2 size={12} />
                삭제
              </button>
              <button
                type="button"
                onClick={saveDraft}
                className="h-8 flex-1 rounded bg-brand text-[11px] font-medium text-white"
              >
                {selected ? "구간 저장" : "새 구간 추가"}
              </button>
            </div>
            <div className="rounded border border-white/10 bg-[#1e1e22] p-2 text-[10px] text-slate-400">
              <p className="font-medium text-slate-300">AI 요약</p>
              <p className="mt-1">
                Person {analysis?.confidence.detectionCoverage ?? 91}% · Pose{" "}
                {analysis?.confidence.poseTrackingQuality ?? 96}%
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom timeline — fixed height */}
      <section className="flex h-40 shrink-0 flex-col border-t border-white/10 bg-[#25252b]">
        <div className="relative flex h-5 shrink-0 items-end justify-between px-[4.5rem] font-mono text-[9px] text-slate-500">
          {ticks.map((tick) => (
            <span key={tick}>{fmt(tick)}</span>
          ))}
        </div>
        <div className="min-h-0 flex-1 space-y-1 overflow-hidden px-2 pb-2">
          <TrackRow label="Stage">
            <TrackCanvas duration={duration} progress={progress} onSeek={setT}>
              {stages.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  title={s.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectStage(s);
                  }}
                  className={`absolute top-0.5 bottom-0.5 rounded-sm opacity-90 hover:opacity-100 ${
                    selected?.kind === "stage" && selected.id === s.id
                      ? "ring-1 ring-white"
                      : ""
                  }`}
                  style={{
                    left: `${(s.start / duration) * 100}%`,
                    width: `${((s.end - s.start) / duration) * 100}%`,
                    background: s.color,
                  }}
                />
              ))}
            </TrackCanvas>
          </TrackRow>
          <TrackRow label="Event">
            <TrackCanvas duration={duration} progress={progress} onSeek={setT}>
              {anomalies.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  title={a.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectAnomaly(a);
                  }}
                  className={`absolute top-0.5 bottom-0.5 rounded-sm bg-red-500/85 hover:bg-red-500 ${
                    selected?.kind === "anomaly" && selected.id === a.id
                      ? "ring-1 ring-white"
                      : ""
                  }`}
                  style={{
                    left: `${(a.start / duration) * 100}%`,
                    width: `${Math.max(1.2, ((a.end - a.start) / duration) * 100)}%`,
                  }}
                />
              ))}
            </TrackCanvas>
          </TrackRow>
          {showAiTrack ? (
            <TrackRow label="AI">
              <div className="relative h-7 overflow-hidden rounded border border-white/10 bg-[#1e1e22]">
                <svg
                  viewBox="0 0 200 28"
                  className="h-full w-full"
                  preserveAspectRatio="none"
                >
                  <path
                    d={sparkPath(personSeries, 200, 28)}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="1.4"
                  />
                  <path
                    d={sparkPath(poseSeries, 200, 28)}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.4"
                    strokeDasharray="3 2"
                  />
                </svg>
                <div
                  className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-brand"
                  style={{ left: `${progress}%` }}
                />
              </div>
            </TrackRow>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function TrackRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid h-7 grid-cols-[3.25rem_1fr] items-center gap-1.5">
      <span className="truncate text-[10px] font-medium text-slate-500">
        {label}
      </span>
      {children}
    </div>
  );
}

function TrackCanvas({
  duration,
  progress,
  onSeek,
  children,
}: {
  duration: number;
  progress: number;
  onSeek: (t: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative h-7 cursor-pointer overflow-hidden rounded border border-white/10 bg-[#1e1e22]"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = Math.min(
          1,
          Math.max(0, (e.clientX - rect.left) / rect.width),
        );
        onSeek(Math.round(ratio * duration));
      }}
    >
      {children}
      <div
        className="pointer-events-none absolute top-0 bottom-0 z-10 w-0.5 bg-brand"
        style={{ left: `${progress}%` }}
      />
    </div>
  );
}

export default function TimelineLabelingPage() {
  return (
    <Suspense
      fallback={
        <p className="p-4 text-sm text-muted">타임라인 라벨링을 불러오는 중…</p>
      }
    >
      <TimelineLabelingInner />
    </Suspense>
  );
}
