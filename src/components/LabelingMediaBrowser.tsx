"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { workers } from "@/data/mock";
import { asset } from "@/lib/asset";
import {
  buildLabelingCatalog,
  filterCatalog,
  productHref,
  sessionsForWorker,
  timelineHref,
  type LabelingMediaItem,
} from "@/lib/labelingMedia";

function workHref(item: LabelingMediaItem) {
  return timelineHref(item) ?? productHref(item);
}

export function LabelingMediaBrowser({
  mode = "full",
  initialWorkerId = "all",
  initialSessionId = "all",
  initialMediaKind = "all",
  onPick,
  selectedKeys,
}: {
  mode?: "full" | "compact";
  initialWorkerId?: string;
  initialSessionId?: string;
  initialMediaKind?: "all" | "video" | "image";
  /** compact: pick without leaving the page */
  onPick?: (item: LabelingMediaItem) => void;
  selectedKeys?: string[];
}) {
  const catalog = useMemo(() => buildLabelingCatalog(), []);
  const [workerId, setWorkerId] = useState(initialWorkerId);
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [mediaKind, setMediaKind] = useState<"all" | "video" | "image">(
    initialMediaKind,
  );
  const [q, setQ] = useState("");
  const active = useMemo(
    () => new Set(selectedKeys ?? []),
    [selectedKeys?.join("|")],
  );

  useEffect(() => {
    setWorkerId(initialWorkerId);
  }, [initialWorkerId]);
  useEffect(() => {
    setSessionId(initialSessionId);
  }, [initialSessionId]);
  useEffect(() => {
    setMediaKind(initialMediaKind);
  }, [initialMediaKind]);

  const sessions = useMemo(() => sessionsForWorker(workerId), [workerId]);
  const filtered = useMemo(
    () =>
      filterCatalog(catalog, {
        workerId,
        sessionId,
        mediaKind,
        q,
      }),
    [catalog, workerId, sessionId, mediaKind, q],
  );

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-xs">
          <span className="mb-1 block text-muted">사람</span>
          <select
            value={workerId}
            onChange={(e) => {
              setWorkerId(e.target.value);
              setSessionId("all");
            }}
            className="w-full rounded-md border border-line bg-surface px-2 py-1.5 text-sm"
          >
            <option value="all">전체 기술자</option>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.id})
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs">
          <span className="mb-1 block text-muted">세션</span>
          <select
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="w-full rounded-md border border-line bg-surface px-2 py-1.5 text-sm"
          >
            <option value="all">전체 세션</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.regNo} · {s.skill} · {s.examDate}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs">
          <span className="mb-1 block text-muted">미디어 유형</span>
          <select
            value={mediaKind}
            onChange={(e) =>
              setMediaKind(e.target.value as "all" | "video" | "image")
            }
            className="w-full rounded-md border border-line bg-surface px-2 py-1.5 text-sm"
          >
            <option value="all">영상 + 이미지</option>
            <option value="video">영상만</option>
            <option value="image">이미지만</option>
          </select>
        </label>
        <label className="block text-xs">
          <span className="mb-1 block text-muted">검색</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="등록번호 · 파일명 · 영상ID"
            className="w-full rounded-md border border-line bg-surface px-2 py-1.5 text-sm"
          />
        </label>
      </div>

      <p className="text-xs text-muted">
        표시 <b className="text-ink">{filtered.length}</b> / 전체 {catalog.length}
        {mode === "full" ? (
          <span> · 항목을 누르면 해당 라벨링 화면으로 이동합니다</span>
        ) : null}
      </p>

      <div
        className={
          mode === "compact"
            ? "max-h-64 space-y-1 overflow-y-auto"
            : "grid gap-2 sm:grid-cols-2 xl:grid-cols-3"
        }
      >
        {filtered.map((it) => {
          const isOn = active.has(it.key);
          const href = workHref(it);
          const thumb =
            it.mediaKind === "image" && it.media.src
              ? asset(it.media.src)
              : null;
          const destLabel =
            it.mediaKind === "video" ? "타임라인 라벨링" : "조형물 좌표";

          const body = (
            <>
              {thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumb}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded object-cover bg-slate-900"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded bg-slate-900 text-[10px] text-slate-300">
                  VIDEO
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{it.media.name}</p>
                <p className="truncate text-muted">
                  {it.kindLabel}
                  {it.media.videoId ? ` · ${it.media.videoId}` : ""}
                </p>
                <p className="truncate text-[10px] text-muted">
                  {it.workerName} · {it.regNo} · {it.examDate}
                </p>
                <p className="mt-1 text-[10px] font-medium text-brand">
                  {destLabel} →
                </p>
              </div>
            </>
          );

          const cardClass = `flex gap-2 rounded-lg border p-2 text-xs transition ${
            isOn
              ? "border-brand bg-brand-soft/30"
              : "border-line bg-surface hover:border-brand/40 hover:bg-brand-soft/20"
          }`;

          if (onPick) {
            return (
              <button
                key={it.key}
                type="button"
                onClick={() => onPick(it)}
                className={`${cardClass} w-full cursor-pointer text-left`}
              >
                {body}
              </button>
            );
          }

          if (!href) {
            return (
              <div key={it.key} className={`${cardClass} opacity-60`}>
                {body}
              </div>
            );
          }

          return (
            <Link key={it.key} href={href} className={cardClass}>
              {body}
            </Link>
          );
        })}
        {!filtered.length ? (
          <p className="col-span-full py-8 text-center text-sm text-muted">
            필터 조건에 맞는 미디어가 없습니다.
          </p>
        ) : null}
      </div>
    </div>
  );
}
