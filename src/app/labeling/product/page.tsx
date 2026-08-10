"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LabelingMediaBrowser } from "@/components/LabelingMediaBrowser";
import {
  getSession,
  getWorker,
  type SessionMedia,
} from "@/data/mock";
import { asset } from "@/lib/asset";
import {
  buildLabelingCatalog,
  type LabelingMediaItem,
} from "@/lib/labelingMedia";

type Box = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  note: string;
};

const ISSUE_LABELS = [
  "정렬 편차",
  "표면 불량",
  "치수 초과",
  "모서리 손상",
  "기타",
];

function ProductLabelingInner() {
  const search = useSearchParams();
  const qSession = search.get("session");
  const qMedia = search.get("media");

  const catalog = useMemo(() => buildLabelingCatalog(), []);
  const images = useMemo(
    () => catalog.filter((c) => c.mediaKind === "image"),
    [catalog],
  );

  const initial = useMemo(() => {
    if (qSession && qMedia) {
      const hit = images.find(
        (i) => i.sessionId === qSession && i.media.id === qMedia,
      );
      if (hit) return hit;
    }
    if (qSession) {
      const hit = images.find((i) => i.sessionId === qSession);
      if (hit) return hit;
    }
    return images[0] ?? null;
  }, [images, qSession, qMedia]);

  const [sessionId, setSessionId] = useState(initial?.sessionId ?? "");
  const [mediaId, setMediaId] = useState(initial?.media.id ?? "");
  const [showPicker, setShowPicker] = useState(true);

  useEffect(() => {
    if (initial) {
      setSessionId(initial.sessionId);
      setMediaId(initial.media.id);
    }
  }, [initial]);

  const session = sessionId ? getSession(sessionId) : undefined;
  const worker = session ? getWorker(session.workerId) : undefined;
  const media: SessionMedia | undefined = session?.media.find(
    (m) => m.id === mediaId,
  );
  const imgSrc = media?.src
    ? asset(media.src)
    : asset("/evidence/products/product-candidate.png");

  const imgRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  } | null>(null);
  const [label, setLabel] = useState(ISSUE_LABELS[0]!);
  const [note, setNote] = useState("");
  const [boxes, setBoxes] = useState<Box[]>([
    {
      id: "b1",
      x: 18,
      y: 22,
      w: 28,
      h: 20,
      label: "정렬 편차",
      note: "맞춤면 간격 초과 (AI 제안)",
    },
  ]);

  function syncUrl(sId: string, mId: string) {
    const url = new URL(window.location.href);
    url.searchParams.set("session", sId);
    url.searchParams.set("media", mId);
    window.history.replaceState({}, "", url.pathname + url.search);
  }

  function pickMedia(item: LabelingMediaItem) {
    if (item.mediaKind !== "image") return;
    setSessionId(item.sessionId);
    setMediaId(item.media.id);
    setBoxes([]);
    syncUrl(item.sessionId, item.media.id);
  }

  function relPos(e: React.MouseEvent) {
    const el = imgRef.current;
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)),
      y: Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100)),
    };
  }

  function onDown(e: React.MouseEvent) {
    const p = relPos(e);
    setDrag({ x0: p.x, y0: p.y, x1: p.x, y1: p.y });
  }
  function onMove(e: React.MouseEvent) {
    if (!drag) return;
    const p = relPos(e);
    setDrag({ ...drag, x1: p.x, y1: p.y });
  }
  function onUp() {
    if (!drag) return;
    const x = Math.min(drag.x0, drag.x1);
    const y = Math.min(drag.y0, drag.y1);
    const w = Math.abs(drag.x1 - drag.x0);
    const h = Math.abs(drag.y1 - drag.y0);
    setDrag(null);
    if (w < 2 || h < 2) return;
    setBoxes((prev) => [
      ...prev,
      {
        id: `b-${Date.now()}`,
        x,
        y,
        w,
        h,
        label,
        note: note || label,
      },
    ]);
    setNote("");
  }

  const preview = drag
    ? {
        x: Math.min(drag.x0, drag.x1),
        y: Math.min(drag.y0, drag.y1),
        w: Math.abs(drag.x1 - drag.x0),
        h: Math.abs(drag.y1 - drag.y0),
      }
    : null;

  const sessionImages =
    session?.media.filter((m) => m.kind !== "video") ?? [];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        결과 조형물 이미지 위에{" "}
        <b className="font-medium text-ink">문제 영역 좌표(박스)</b>를
        표시합니다. 사람·세션·이미지 필터로 대상을 고른 뒤 드래그로 bbox를
        그립니다.
      </p>

      <div className="rounded-lg border border-line bg-surface">
        <button
          type="button"
          onClick={() => setShowPicker((v) => !v)}
          className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium"
        >
          <span>
            이미지 선택 · 필터
            {session && media ? (
              <span className="ml-2 font-normal text-muted">
                {session.regNo} · {media.name}
              </span>
            ) : null}
          </span>
          <span className="text-muted">{showPicker ? "접기" : "펼치기"}</span>
        </button>
        {showPicker ? (
          <div className="border-t border-line px-3 py-3">
            <LabelingMediaBrowser
              mode="compact"
              initialWorkerId={session?.workerId ?? "all"}
              initialSessionId={sessionId || "all"}
              initialMediaKind="image"
              selectedKeys={
                sessionId && mediaId ? [`${sessionId}:${mediaId}`] : undefined
              }
              onPick={pickMedia}
            />
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-line bg-surface px-3 py-2.5 text-xs">
        <span>
          <span className="text-muted">기술자 </span>
          <b className="font-medium">
            {worker?.name ?? session?.workerId ?? "—"}
          </b>
        </span>
        <span className="text-line">|</span>
        <span>
          <span className="text-muted">세션 </span>
          <b className="font-medium">{session?.regNo ?? "—"}</b>
        </span>
        <span className="text-line">|</span>
        <label className="inline-flex items-center gap-1.5">
          <span className="text-muted">이미지</span>
          <select
            value={mediaId}
            onChange={(e) => {
              const id = e.target.value;
              setMediaId(id);
              setBoxes([]);
              if (sessionId) syncUrl(sessionId, id);
            }}
            className="max-w-[16rem] truncate rounded border border-line bg-bg px-1.5 py-0.5 font-medium"
          >
            {sessionImages.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="rounded-xl border border-line bg-surface p-4 lg:col-span-3">
          <div
            ref={imgRef}
            className="relative aspect-[4/3] cursor-crosshair select-none overflow-hidden rounded-lg bg-slate-100"
            onMouseDown={onDown}
            onMouseMove={onMove}
            onMouseUp={onUp}
            onMouseLeave={() => drag && onUp()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgSrc}
              alt={media?.name ?? "결과 조형물"}
              className="pointer-events-none h-full w-full object-contain"
              draggable={false}
            />
            {boxes.map((b) => (
              <div
                key={b.id}
                className="absolute border-2 border-danger bg-danger/10"
                style={{
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  width: `${b.w}%`,
                  height: `${b.h}%`,
                }}
              >
                <span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-danger px-1 text-[10px] text-white">
                  {b.label}
                </span>
              </div>
            ))}
            {preview ? (
              <div
                className="absolute border-2 border-brand bg-brand/10"
                style={{
                  left: `${preview.x}%`,
                  top: `${preview.y}%`,
                  width: `${preview.w}%`,
                  height: `${preview.h}%`,
                }}
              />
            ) : null}
          </div>
          <p className="mt-2 text-[11px] text-muted">
            드래그하여 박스를 그립니다. 좌표는 이미지 대비 %로 저장됩니다.
          </p>
        </section>

        <section className="rounded-xl border border-line bg-surface p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold">문제점 라벨</h2>
          <label className="mt-3 block text-sm">
            <span className="mb-1 block text-xs text-muted">유형</span>
            <select
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full rounded-lg border border-line bg-bg px-3 py-2"
            >
              {ISSUE_LABELS.map((l) => (
                <option key={l} value={l}>
                  {l}
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
            />
          </label>

          <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto text-sm">
            {boxes.map((b) => (
              <li
                key={b.id}
                className="rounded-lg border border-line bg-bg px-3 py-2"
              >
                <p className="font-medium">{b.label}</p>
                <p className="font-mono text-[11px] text-muted">
                  x:{b.x.toFixed(1)}% y:{b.y.toFixed(1)}% w:{b.w.toFixed(1)}% h:
                  {b.h.toFixed(1)}%
                </p>
                <p className="mt-1 text-xs text-muted">{b.note}</p>
                <button
                  type="button"
                  className="mt-1 text-[11px] text-danger hover:underline"
                  onClick={() =>
                    setBoxes((prev) => prev.filter((x) => x.id !== b.id))
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

export default function ProductLabelingPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted">조형물 좌표 라벨링을 불러오는 중…</p>
      }
    >
      <ProductLabelingInner />
    </Suspense>
  );
}
