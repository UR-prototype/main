"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Save, Trash2 } from "lucide-react";
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
  const [savedFlash, setSavedFlash] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>("b1");

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
  const sessionImages =
    session?.media.filter((m) => m.kind !== "video") ?? [];

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

  const selected = boxes.find((b) => b.id === selectedId) ?? null;

  function syncUrl(sId: string, mId: string) {
    const url = new URL(window.location.href);
    url.searchParams.set("session", sId);
    url.searchParams.set("media", mId);
    window.history.replaceState({}, "", url.pathname + url.search);
  }

  function pickFromSelect(mId: string) {
    setMediaId(mId);
    setBoxes([]);
    setSelectedId(null);
    if (sessionId) syncUrl(sessionId, mId);
  }

  function switchImage(item: LabelingMediaItem) {
    if (item.mediaKind !== "image") return;
    setSessionId(item.sessionId);
    setMediaId(item.media.id);
    setBoxes([]);
    setSelectedId(null);
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
    setSelectedId(null);
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
    const id = `b-${Date.now()}`;
    setBoxes((prev) => [
      ...prev,
      { id, x, y, w, h, label, note: note || label },
    ]);
    setSelectedId(id);
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

  function updateSelected(patch: Partial<Box>) {
    if (!selectedId) return;
    setBoxes((prev) =>
      prev.map((b) => (b.id === selectedId ? { ...b, ...patch } : b)),
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#1e1e22] text-[12px] text-slate-200">
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-white/10 bg-[#2a2a30] px-2">
        <select
          value={`${sessionId}:${mediaId}`}
          onChange={(e) => {
            const [sId, mId] = e.target.value.split(":");
            const hit = images.find(
              (i) => i.sessionId === sId && i.media.id === mId,
            );
            if (hit) switchImage(hit);
            else if (mId) pickFromSelect(mId);
          }}
          className="h-7 max-w-[18rem] truncate rounded border border-white/15 bg-[#1e1e22] px-2 text-[11px]"
        >
          {images.map((it) => (
            <option key={it.key} value={`${it.sessionId}:${it.media.id}`}>
              {it.workerName} · {it.regNo} · {it.media.name}
            </option>
          ))}
        </select>
        <span className="hidden truncate text-[11px] text-slate-400 sm:inline">
          {worker?.name ?? "—"}
          {session ? ` · ${session.regNo}` : ""}
        </span>
        <span className="text-[11px] text-slate-500">
          드래그로 bbox · {boxes.length}개
        </span>
        <button
          type="button"
          onClick={() => {
            setSavedFlash(true);
            window.setTimeout(() => setSavedFlash(false), 1200);
          }}
          className="ml-auto inline-flex h-7 items-center gap-1 rounded bg-brand px-2.5 text-[11px] font-medium text-white"
        >
          <Save size={12} />
          {savedFlash ? "저장됨" : "저장"}
        </button>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-48 shrink-0 flex-col border-r border-white/10 bg-[#25252b]">
          <div className="flex h-8 shrink-0 items-center justify-between border-b border-white/10 px-2">
            <span className="text-[11px] font-semibold text-slate-300">
              객체
            </span>
            <span className="text-[10px] text-slate-500">{boxes.length}</span>
          </div>
          <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-1.5">
            {boxes.map((b, i) => (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(b.id);
                    setLabel(b.label);
                    setNote(b.note);
                  }}
                  className={`flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left ${
                    selectedId === b.id
                      ? "bg-brand/25 text-white"
                      : "hover:bg-white/5"
                  }`}
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-red-400" />
                  <span className="min-w-0 flex-1 truncate">
                    {i + 1}. {b.label}
                  </span>
                </button>
              </li>
            ))}
            {!boxes.length ? (
              <li className="px-2 py-6 text-center text-[11px] text-slate-500">
                캔버스에서 드래그하여 추가
              </li>
            ) : null}
          </ul>
          <div className="border-t border-white/10 p-1.5">
            <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              라벨 팔레트
            </p>
            <div className="flex flex-wrap gap-1">
              {ISSUE_LABELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLabel(l)}
                  className={`rounded px-1.5 py-0.5 text-[10px] ${
                    label === l
                      ? "bg-brand text-white"
                      : "border border-white/15 text-slate-400 hover:bg-white/5"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="relative min-w-0 flex-1 bg-black">
          <div
            ref={imgRef}
            className="absolute inset-0 cursor-crosshair select-none"
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
              <button
                key={b.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(b.id);
                  setLabel(b.label);
                  setNote(b.note);
                }}
                className={`absolute border-2 ${
                  selectedId === b.id
                    ? "border-brand bg-brand/15"
                    : "border-red-400 bg-red-500/10"
                }`}
                style={{
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  width: `${b.w}%`,
                  height: `${b.h}%`,
                }}
              >
                <span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-red-500 px-1 text-[10px] text-white">
                  {b.label}
                </span>
              </button>
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
        </section>

        <aside className="flex w-56 shrink-0 flex-col border-l border-white/10 bg-[#25252b]">
          <div className="flex h-8 shrink-0 items-center border-b border-white/10 px-2 text-[11px] font-semibold text-slate-300">
            속성
          </div>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
            <label className="block">
              <span className="mb-0.5 block text-[10px] text-slate-500">
                세션 이미지
              </span>
              <select
                value={mediaId}
                onChange={(e) => pickFromSelect(e.target.value)}
                className="h-8 w-full rounded border border-white/15 bg-[#1e1e22] px-2 text-[11px]"
              >
                {sessionImages.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-0.5 block text-[10px] text-slate-500">유형</span>
              <select
                value={selected?.label ?? label}
                onChange={(e) => {
                  setLabel(e.target.value);
                  updateSelected({ label: e.target.value });
                }}
                className="h-8 w-full rounded border border-white/15 bg-[#1e1e22] px-2 text-[11px]"
              >
                {ISSUE_LABELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-0.5 block text-[10px] text-slate-500">메모</span>
              <textarea
                rows={3}
                value={selected ? selected.note : note}
                onChange={(e) => {
                  setNote(e.target.value);
                  updateSelected({ note: e.target.value });
                }}
                className="w-full resize-none rounded border border-white/15 bg-[#1e1e22] px-2 py-1.5 text-[11px]"
              />
            </label>
            {selected ? (
              <p className="font-mono text-[10px] text-slate-500">
                x:{selected.x.toFixed(1)} y:{selected.y.toFixed(1)} w:
                {selected.w.toFixed(1)} h:{selected.h.toFixed(1)}
              </p>
            ) : (
              <p className="text-[10px] text-slate-500">
                선택 없음 · 캔버스 드래그로 새 박스
              </p>
            )}
            <button
              type="button"
              disabled={!selectedId}
              onClick={() => {
                setBoxes((prev) => prev.filter((x) => x.id !== selectedId));
                setSelectedId(null);
              }}
              className="inline-flex h-8 w-full items-center justify-center gap-1 rounded border border-white/15 text-red-300 disabled:opacity-40"
            >
              <Trash2 size={12} />
              선택 삭제
            </button>
            <p className="flex items-start gap-1 text-[10px] text-slate-500">
              <Plus size={11} className="mt-0.5 shrink-0" />
              새 박스는 왼쪽 팔레트 라벨로 그려집니다.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function ProductLabelingPage() {
  return (
    <Suspense
      fallback={
        <p className="p-4 text-sm text-muted">조형물 좌표 라벨링을 불러오는 중…</p>
      }
    >
      <ProductLabelingInner />
    </Suspense>
  );
}
