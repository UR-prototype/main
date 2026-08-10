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
  /** compact: single pick callback */
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
  const [checked, setChecked] = useState<Set<string>>(
    () => new Set(selectedKeys ?? []),
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
  useEffect(() => {
    if (selectedKeys) setChecked(new Set(selectedKeys));
  }, [selectedKeys?.join("|")]);

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

  const selectedItems = filtered.filter((it) => checked.has(it.key));

  function toggle(key: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function selectAllFiltered() {
    setChecked(new Set(filtered.map((f) => f.key)));
  }

  function clearSelection() {
    setChecked(new Set());
  }

  return (
    <div className="space-y-3">
      <div
        className={`grid gap-2 ${
          mode === "full" ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-4"
        }`}
      >
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

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <p className="text-muted">
          표시 <b className="text-ink">{filtered.length}</b> / 전체 {catalog.length}
          {checked.size ? (
            <>
              {" · "}
              선택 <b className="text-brand">{checked.size}</b>
            </>
          ) : null}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={selectAllFiltered}
            className="rounded-md border border-line px-2 py-1 hover:bg-bg"
          >
            현재 목록 전체 선택
          </button>
          <button
            type="button"
            onClick={clearSelection}
            className="rounded-md border border-line px-2 py-1 hover:bg-bg"
          >
            선택 해제
          </button>
        </div>
      </div>

      {checked.size > 0 && mode === "full" ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-brand/30 bg-brand-soft/40 px-3 py-2 text-xs">
          <span className="font-medium text-ink">
            선택 {checked.size}건 작업
          </span>
          {selectedItems.some((i) => i.mediaKind === "video") ? (
            <Link
              href={
                timelineHref(
                  selectedItems.find((i) => i.mediaKind === "video")!,
                ) ?? "/labeling/"
              }
              className="rounded-md bg-brand px-2.5 py-1 font-medium text-white"
            >
              타임라인 라벨로
            </Link>
          ) : null}
          {selectedItems.some((i) => i.mediaKind === "image") ? (
            <Link
              href={
                productHref(
                  selectedItems.find((i) => i.mediaKind === "image")!,
                ) ?? "/labeling/product/"
              }
              className="rounded-md border border-line bg-surface px-2.5 py-1 font-medium"
            >
              조형물 좌표로
            </Link>
          ) : null}
          <span className="text-muted">
            (복수 선택 시 첫 해당 미디어로 이동합니다)
          </span>
        </div>
      ) : null}

      <div
        className={
          mode === "compact"
            ? "max-h-64 space-y-1 overflow-y-auto"
            : "grid gap-2 sm:grid-cols-2 xl:grid-cols-3"
        }
      >
        {filtered.map((it) => {
          const isOn = checked.has(it.key);
          const thumb =
            it.mediaKind === "image" && it.media.src
              ? asset(it.media.src)
              : null;
          return (
            <div
              key={it.key}
              className={`flex gap-2 rounded-lg border p-2 text-xs transition ${
                isOn
                  ? "border-brand bg-brand-soft/30"
                  : "border-line bg-surface hover:border-brand/40"
              }`}
            >
              <label className="flex shrink-0 items-start pt-0.5">
                <input
                  type="checkbox"
                  checked={isOn}
                  onChange={() => toggle(it.key)}
                  className="accent-brand"
                />
              </label>
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
                <div className="mt-1 flex flex-wrap gap-2">
                  {onPick ? (
                    <button
                      type="button"
                      onClick={() => onPick(it)}
                      className="text-brand hover:underline"
                    >
                      이 미디어 작업
                    </button>
                  ) : null}
                  {timelineHref(it) ? (
                    <Link
                      href={timelineHref(it)!}
                      className="text-brand hover:underline"
                    >
                      타임라인
                    </Link>
                  ) : null}
                  {productHref(it) ? (
                    <Link
                      href={productHref(it)!}
                      className="text-brand hover:underline"
                    >
                      좌표
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
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
