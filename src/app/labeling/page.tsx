"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Pause,
  Pencil,
  Play,
  Plus,
  Save,
  Trash2,
  Volume2,
} from "lucide-react";
import { analyses, getWorker, jobs } from "@/data/mock";
import { asset } from "@/lib/asset";

type StudioTab = "video" | "stage" | "anomaly";
type IntervalKind = "stage" | "anomaly";

type StageSeg = {
  id: string;
  name: string;
  start: number;
  end: number;
  color: string;
  note: string;
};

type AnomalySeg = {
  id: string;
  name: string;
  start: number;
  end: number;
  note: string;
};

const STAGE_COLORS = [
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#0d9488",
  "#64748b",
  "#f59e0b",
];

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

export default function TimelineLabelingPage() {
  const completed = useMemo(
    () => jobs.filter((j) => j.status === "completed"),
    [],
  );
  const [videoId, setVideoId] = useState(
    completed.find((j) => j.videoId === "V-101")?.videoId ??
      completed[0]?.videoId ??
      "V-101",
  );
  const job = jobs.find((j) => j.videoId === videoId) ?? jobs[0]!;
  const worker = getWorker(job.workerId);
  const analysis = analyses[job.videoId];
  const frames = analysis?.evidenceFrames ?? [];
  const duration = 347;

  const [tab, setTab] = useState<StudioTab>("video");
  const [t, setT] = useState(83);
  const [playing, setPlaying] = useState(false);
  const [showAiTrack, setShowAiTrack] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [savedFlash, setSavedFlash] = useState(false);

  const [stages, setStages] = useState<StageSeg[]>([
    {
      id: "st1",
      name: "부품 준비",
      start: 0,
      end: 48,
      color: STAGE_COLORS[0]!,
      note: "자재·공구 배치",
    },
    {
      id: "st2",
      name: "부품 조립",
      start: 48,
      end: 135,
      color: STAGE_COLORS[1]!,
      note: "본조립 구간",
    },
    {
      id: "st3",
      name: "체결·고정",
      start: 135,
      end: 220,
      color: STAGE_COLORS[2]!,
      note: "볼트·클램프 체결",
    },
    {
      id: "st4",
      name: "검사·확인",
      start: 220,
      end: 310,
      color: STAGE_COLORS[3]!,
      note: "치수·외관 점검",
    },
    {
      id: "st5",
      name: "정리",
      start: 310,
      end: 347,
      color: STAGE_COLORS[4]!,
      note: "작업장 정리",
    },
  ]);

  const [anomalies, setAnomalies] = useState<AnomalySeg[]>([
    {
      id: "an1",
      name: "작업순서 오류",
      start: 72,
      end: 88,
      note: "체결 전 검사 생략 (AI 제안)",
    },
    {
      id: "an2",
      name: "부적절한 자세",
      start: 185,
      end: 202,
      note: "허리 굽힘 지속 · 자세 경고",
    },
  ]);

  const [selected, setSelected] = useState<{
    kind: IntervalKind;
    id: string;
  } | null>({ kind: "anomaly", id: "an1" });

  const [draft, setDraft] = useState({
    kind: "anomaly" as IntervalKind,
    name: "작업순서 오류",
    start: 72,
    end: 88,
    note: "체결 전 검사 생략 (AI 제안)",
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

  const previewFrames = useMemo(() => {
    if (!selected) return frames.slice(0, 5);
    const range =
      selected.kind === "stage"
        ? stages.find((s) => s.id === selected.id)
        : anomalies.find((a) => a.id === selected.id);
    if (!range) return frames.slice(0, 5);
    const inRange = frames.filter(
      (f) => f.t >= range.start - 5 && f.t <= range.end + 5,
    );
    return (inRange.length ? inRange : frames).slice(0, 6);
  }, [selected, stages, anomalies, frames]);

  function selectStage(s: StageSeg) {
    setSelected({ kind: "stage", id: s.id });
    setDraft({
      kind: "stage",
      name: s.name,
      start: s.start,
      end: s.end,
      note: s.note,
    });
    setT(s.start);
    setTab("stage");
  }

  function selectAnomaly(a: AnomalySeg) {
    setSelected({ kind: "anomaly", id: a.id });
    setDraft({
      kind: "anomaly",
      name: a.name,
      start: a.start,
      end: a.end,
      note: a.note,
    });
    setT(a.start);
    setTab("anomaly");
  }

  function saveDraft() {
    const start = Math.min(draft.start, draft.end);
    const end = Math.max(draft.start, draft.end);
    if (end - start < 1) {
      alert("구간이 너무 짧습니다.");
      return;
    }
    if (draft.kind === "stage") {
      if (selected?.kind === "stage") {
        setStages((prev) =>
          prev.map((s) =>
            s.id === selected.id
              ? { ...s, name: draft.name, start, end, note: draft.note }
              : s,
          ),
        );
      } else {
        const id = `st-${Date.now()}`;
        setStages((prev) => [
          ...prev,
          {
            id,
            name: draft.name || "새 단계",
            start,
            end,
            color: STAGE_COLORS[prev.length % STAGE_COLORS.length]!,
            note: draft.note,
          },
        ]);
        setSelected({ kind: "stage", id });
      }
    } else if (selected?.kind === "anomaly") {
      setAnomalies((prev) =>
        prev.map((a) =>
          a.id === selected.id
            ? { ...a, name: draft.name, start, end, note: draft.note }
            : a,
        ),
      );
    } else {
      const id = `an-${Date.now()}`;
      setAnomalies((prev) => [
        ...prev,
        {
          id,
          name: draft.name || "이상행동",
          start,
          end,
          note: draft.note,
        },
      ]);
      setSelected({ kind: "anomaly", id });
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

  function addStage() {
    const last = stages[stages.length - 1];
    const start = last ? Math.min(duration - 20, last.end) : t;
    const end = Math.min(duration, start + 30);
    setDraft({
      kind: "stage",
      name: `단계 ${stages.length + 1}`,
      start,
      end,
      note: "",
    });
    setSelected(null);
    setTab("stage");
  }

  function addAnomaly() {
    setDraft({
      kind: "anomaly",
      name: "이상행동",
      start: Math.max(0, t - 5),
      end: Math.min(duration, t + 10),
      note: "",
    });
    setSelected(null);
    setTab("anomaly");
  }

  function goVideo(dir: -1 | 1) {
    if (!completed.length) return;
    const next =
      completed[(jobIndex + dir + completed.length) % completed.length]!;
    setVideoId(next.videoId);
    setT(0);
    setSelected(null);
  }

  function finishSave() {
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1600);
  }

  const ticks = [0, 60, 120, 180, 240, 300, 347];

  return (
    <div className="space-y-3">
      {/* Session meta */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-line bg-surface px-3 py-2.5 text-xs">
        <Meta
          label="기술자"
          value={`${worker?.name ?? job.workerId} [${job.workerId}]`}
        />
        <Sep />
        <Meta label="작업" value={`${job.jobType} / 조립 작업`} />
        <Sep />
        <Meta label="시나리오" value="시나리오 A · 기본 조립" />
        <Sep />
        <label className="inline-flex items-center gap-1.5">
          <span className="text-muted">영상</span>
          <select
            value={videoId}
            onChange={(e) => {
              setVideoId(e.target.value);
              setT(0);
            }}
            className="max-w-[14rem] truncate rounded border border-line bg-bg px-1.5 py-0.5 font-medium"
          >
            {completed.map((j) => (
              <option key={j.videoId} value={j.videoId}>
                {j.videoName}
              </option>
            ))}
          </select>
        </label>
        <Sep />
        <Meta label="길이" value={fmt(duration)} />
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => goVideo(-1)}
            className="inline-flex items-center gap-0.5 rounded-md border border-line px-2 py-1 hover:bg-bg"
          >
            <ChevronLeft size={14} />
            이전
          </button>
          <button
            type="button"
            onClick={() => goVideo(1)}
            className="inline-flex items-center gap-0.5 rounded-md border border-line px-2 py-1 hover:bg-bg"
          >
            다음
            <ChevronRight size={14} />
          </button>
          <button
            type="button"
            onClick={finishSave}
            className="inline-flex items-center gap-1 rounded-md bg-brand px-2.5 py-1 font-medium text-white"
          >
            <Save size={13} />
            {savedFlash ? "저장됨" : "저장 후 완료"}
          </button>
        </div>
      </div>

      {/* Studio tabs */}
      <div className="flex gap-1 border-b border-line text-sm">
        {(
          [
            ["video", "영상 · AI 분석 결과"],
            ["stage", "작업 단계 라벨링"],
            ["anomaly", "이상행동 라벨링"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`-mb-px border-b-2 px-3 py-2 text-xs font-medium transition ${
              tab === id
                ? "border-brand text-brand"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-12">
        {/* Video */}
        <section className="overflow-hidden rounded-lg border border-line bg-surface xl:col-span-8">
          <div className="relative aspect-video bg-slate-950">
            {cleanSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tab === "video" && poseSrc ? poseSrc : cleanSrc}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-90"
                onError={(e) => {
                  if (cleanSrc) e.currentTarget.src = cleanSrc;
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                프레임 없음
              </div>
            )}
            {tab === "video" ? (
              <>
                <div className="absolute left-[18%] top-[12%] h-[72%] w-[28%] rounded border-2 border-emerald-400/90 shadow-[0_0_0_1px_rgba(0,0,0,.35)]">
                  <span className="absolute -top-5 left-0 rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
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
                    strokeWidth="0.6"
                    points="32,22 32,38 28,52 26,68 30,82 38,82 36,68 34,52 40,38 48,38 52,52 54,68 50,82 58,82 56,68 54,52 48,38 40,22 32,22"
                  />
                  <circle cx="36" cy="18" r="2.2" fill="#34d399" />
                </svg>
              </>
            ) : null}
            {frame ? (
              <div className="absolute bottom-3 left-3 max-w-[70%] rounded bg-black/55 px-2 py-1 text-[11px] text-white">
                {frame.title} · {fmt(frame.t)}
              </div>
            ) : null}
          </div>

          <div className="space-y-2 border-t border-line px-3 py-2.5">
            <input
              type="range"
              min={0}
              max={duration}
              value={t}
              onChange={(e) => setT(Number(e.target.value))}
              className="w-full accent-brand"
            />
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-line text-ink hover:bg-bg"
                aria-label={playing ? "일시정지" : "재생"}
              >
                {playing ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <span className="font-mono tabular-nums text-ink">
                {fmt(t)} / {fmt(duration)}
              </span>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md border border-line px-1.5 py-0.5"
              >
                <Volume2 size={12} />
              </button>
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="rounded border border-line bg-bg px-1.5 py-0.5"
              >
                {[0.5, 1, 1.5, 2].map((s) => (
                  <option key={s} value={s}>
                    {s.toFixed(1)}x
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setT((x) => Math.max(0, x - 5))}
                className="rounded border border-line px-1.5 py-0.5"
              >
                -5s
              </button>
              <button
                type="button"
                onClick={() => setT((x) => Math.min(duration, x + 5))}
                className="rounded border border-line px-1.5 py-0.5"
              >
                +5s
              </button>
            </div>
          </div>
        </section>

        {/* Right panel */}
        <aside className="flex flex-col gap-3 xl:col-span-4">
          <section className="rounded-lg border border-line bg-surface p-3">
            <h2 className="text-xs font-semibold">AI 자동 분석 정보</h2>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <AiStat
                title="객체 검출 (Person)"
                rows={[
                  ["모델", "YOLOv8n"],
                  ["신뢰도", "0.98"],
                  ["검출률", `${analysis?.confidence.detectionCoverage ?? 91}%`],
                ]}
              />
              <AiStat
                title="자세 추정 (Pose)"
                rows={[
                  ["모델", "MediaPipe Pose"],
                  [
                    "품질",
                    `${analysis?.confidence.poseTrackingQuality ?? 96}%`,
                  ],
                  ["키포인트", `${analysis?.posePoints?.toLocaleString() ?? "—"}`],
                ]}
              />
            </div>
          </section>

          <section
            className={`rounded-lg border bg-surface p-3 ${
              tab === "stage" ? "border-brand/50 ring-1 ring-brand/20" : "border-line"
            }`}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="text-xs font-semibold">작업 단계 목록</h2>
              <button
                type="button"
                onClick={addStage}
                className="inline-flex items-center gap-0.5 text-[11px] font-medium text-brand hover:underline"
              >
                <Plus size={12} />
                단계 추가
              </button>
            </div>
            <ul className="max-h-44 space-y-1.5 overflow-y-auto">
              {stages.map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => selectStage(s)}
                    className={`flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left text-xs transition ${
                      selected?.kind === "stage" && selected.id === s.id
                        ? "border-brand bg-brand-soft/40"
                        : "border-line hover:bg-bg"
                    }`}
                  >
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white"
                      style={{ background: s.color }}
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{s.name}</span>
                      <span className="font-mono text-[10px] text-muted">
                        {fmt(s.start)}–{fmt(s.end)}
                      </span>
                    </span>
                    <Pencil size={12} className="shrink-0 text-muted" />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section
            className={`rounded-lg border bg-surface p-3 ${
              tab === "anomaly"
                ? "border-danger/40 ring-1 ring-danger/15"
                : "border-line"
            }`}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="text-xs font-semibold">이상행동 목록</h2>
              <button
                type="button"
                onClick={addAnomaly}
                className="inline-flex items-center gap-0.5 text-[11px] font-medium text-brand hover:underline"
              >
                <Plus size={12} />
                이상행동 추가
              </button>
            </div>
            <ul className="max-h-40 space-y-1.5 overflow-y-auto">
              {anomalies.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => selectAnomaly(a)}
                    className={`flex w-full items-start gap-2 rounded-md border px-2 py-1.5 text-left text-xs transition ${
                      selected?.kind === "anomaly" && selected.id === a.id
                        ? "border-danger/50 bg-red-50"
                        : "border-line hover:bg-bg"
                    }`}
                  >
                    <AlertTriangle
                      size={14}
                      className="mt-0.5 shrink-0 text-danger"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{a.name}</span>
                      <span className="font-mono text-[10px] text-muted">
                        {fmt(a.start)}–{fmt(a.end)}
                      </span>
                      <span className="mt-0.5 block truncate text-[10px] text-muted">
                        {a.note}
                      </span>
                    </span>
                    <button
                      type="button"
                      className="shrink-0 text-muted hover:text-danger"
                      aria-label="삭제"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAnomalies((prev) =>
                          prev.filter((x) => x.id !== a.id),
                        );
                        if (selected?.id === a.id) setSelected(null);
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      {/* Bottom: timeline + editor + preview */}
      <section className="rounded-lg border border-line bg-surface p-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xs font-semibold">타임라인</h2>
          <label className="inline-flex items-center gap-2 text-[11px] text-muted">
            <span>AI 분석 결과 표시</span>
            <button
              type="button"
              role="switch"
              aria-checked={showAiTrack}
              onClick={() => setShowAiTrack((v) => !v)}
              className={`relative h-5 w-9 rounded-full transition ${
                showAiTrack ? "bg-brand" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                  showAiTrack ? "left-4" : "left-0.5"
                }`}
              />
            </button>
          </label>
        </div>

        <div className="relative mb-1 flex justify-between px-14 font-mono text-[10px] text-muted">
          {ticks.map((tick) => (
            <span key={tick}>{fmt(tick)}</span>
          ))}
        </div>

        <div className="space-y-1.5">
          <TrackRow label="작업 단계">
            <TrackCanvas
              duration={duration}
              progress={progress}
              onSeek={setT}
            >
              {stages.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  title={s.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectStage(s);
                  }}
                  className="absolute top-1 bottom-1 rounded-sm opacity-90 hover:opacity-100"
                  style={{
                    left: `${(s.start / duration) * 100}%`,
                    width: `${((s.end - s.start) / duration) * 100}%`,
                    background: s.color,
                  }}
                />
              ))}
            </TrackCanvas>
          </TrackRow>

          <TrackRow label="이상행동">
            <TrackCanvas
              duration={duration}
              progress={progress}
              onSeek={setT}
            >
              {anomalies.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  title={a.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectAnomaly(a);
                  }}
                  className="absolute top-1 bottom-1 rounded-sm bg-danger/85 hover:bg-danger"
                  style={{
                    left: `${(a.start / duration) * 100}%`,
                    width: `${Math.max(1.2, ((a.end - a.start) / duration) * 100)}%`,
                  }}
                />
              ))}
            </TrackCanvas>
          </TrackRow>

          {showAiTrack ? (
            <TrackRow label="AI 분석">
              <div className="relative h-12 overflow-hidden rounded border border-line bg-bg px-1">
                <svg
                  viewBox="0 0 200 40"
                  className="h-full w-full"
                  preserveAspectRatio="none"
                >
                  <path
                    d={sparkPath(personSeries, 200, 40)}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                  />
                  <path
                    d={sparkPath(poseSeries, 200, 40)}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="3 2"
                  />
                </svg>
                <div
                  className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-brand"
                  style={{ left: `${progress}%` }}
                />
                <div className="absolute bottom-0.5 right-1 flex gap-2 text-[9px] text-muted">
                  <span className="text-blue-600">Person</span>
                  <span className="text-emerald-600">Pose</span>
                </div>
              </div>
            </TrackRow>
          ) : null}
        </div>
      </section>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="rounded-lg border border-line bg-surface p-3">
          <h2 className="mb-2 text-xs font-semibold">선택 구간 정보</h2>
          <div className="mb-2 flex gap-1">
            {(
              [
                ["stage", "작업 단계"],
                ["anomaly", "이상행동"],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setDraft((d) => ({ ...d, kind: k }))}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${
                  draft.kind === k
                    ? "bg-brand text-white"
                    : "border border-line text-muted hover:bg-bg"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block text-xs sm:col-span-2">
              <span className="mb-1 block text-muted">이름</span>
              <input
                value={draft.name}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, name: e.target.value }))
                }
                className="w-full rounded-md border border-line bg-bg px-2 py-1.5"
              />
            </label>
            <label className="block text-xs">
              <span className="mb-1 block text-muted">시작</span>
              <input
                type="number"
                min={0}
                max={duration}
                value={draft.start}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, start: Number(e.target.value) }))
                }
                className="w-full rounded-md border border-line bg-bg px-2 py-1.5 font-mono"
              />
            </label>
            <label className="block text-xs">
              <span className="mb-1 block text-muted">종료</span>
              <input
                type="number"
                min={0}
                max={duration}
                value={draft.end}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, end: Number(e.target.value) }))
                }
                className="w-full rounded-md border border-line bg-bg px-2 py-1.5 font-mono"
              />
            </label>
            <p className="text-[11px] text-muted sm:col-span-2">
              길이{" "}
              <span className="font-mono text-ink">
                {fmt(Math.abs(draft.end - draft.start))}
              </span>
            </p>
            <label className="block text-xs sm:col-span-2">
              <span className="mb-1 block text-muted">설명</span>
              <textarea
                rows={2}
                value={draft.note}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, note: e.target.value }))
                }
                className="w-full resize-none rounded-md border border-line bg-bg px-2 py-1.5"
              />
            </label>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={deleteSelected}
              disabled={!selected}
              className="rounded-md border border-line px-3 py-1.5 text-xs text-danger disabled:opacity-40"
            >
              삭제
            </button>
            <button
              type="button"
              onClick={saveDraft}
              className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white"
            >
              저장
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-line bg-surface p-3">
          <h2 className="mb-1 text-xs font-semibold">AI 분석 미리보기</h2>
          <p className="mb-2 text-[11px] text-muted">
            선택 구간의 Person 검출 · Pose 키포인트 프레임
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {previewFrames.map((f) => (
              <button
                key={`${f.src}-${f.t}`}
                type="button"
                onClick={() => setT(f.t)}
                className="overflow-hidden rounded border border-line text-left hover:border-brand"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset(f.src)}
                  alt=""
                  className="aspect-video w-full object-cover bg-slate-900"
                />
                <span className="block truncate px-1 py-0.5 font-mono text-[9px] text-muted">
                  {fmt(f.t)}
                </span>
              </button>
            ))}
            {!previewFrames.length ? (
              <p className="col-span-full py-6 text-center text-xs text-muted">
                미리보기 프레임 없음
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex items-baseline gap-1.5">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}

function Sep() {
  return <span className="hidden h-3 w-px bg-line sm:block" aria-hidden />;
}

function AiStat({
  title,
  rows,
}: {
  title: string;
  rows: [string, string][];
}) {
  return (
    <div className="rounded-md border border-line bg-bg px-2.5 py-2">
      <p className="text-[11px] font-semibold">{title}</p>
      <dl className="mt-1 space-y-0.5">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2 text-[10px]">
            <dt className="text-muted">{k}</dt>
            <dd className="font-medium tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
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
    <div className="grid grid-cols-[3.5rem_1fr] items-center gap-2">
      <span className="text-[10px] font-medium text-muted">{label}</span>
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
      className="relative h-8 cursor-pointer overflow-hidden rounded border border-line bg-bg"
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
