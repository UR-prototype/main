"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  assessmentSessions,
  getSession,
  getWorker,
  mediaCounts,
  workers,
  type SessionMedia,
} from "@/data/mock";

export default function RegisterProductPage() {
  const [sessionId, setSessionId] = useState(
    assessmentSessions[0]?.id ?? "S-001",
  );
  const [added, setAdded] = useState<SessionMedia[]>([]);
  const [saved, setSaved] = useState(false);

  const sessions = useMemo(
    () =>
      [...assessmentSessions].sort((a, b) =>
        b.examDate.localeCompare(a.examDate),
      ),
    [],
  );
  const session = getSession(sessionId);
  const worker = session ? getWorker(session.workerId) : undefined;
  const counts = session ? mediaCounts(session) : { videos: 0, products: 0 };

  function addFiles(
    files: FileList | null,
    kind: "product_ref" | "product_candidate" | "product_other",
  ) {
    if (!files?.length) return;
    setAdded((prev) => [
      ...prev,
      ...Array.from(files).map((f, i) => ({
        id: `add-${Date.now()}-${i}`,
        kind,
        name: f.name,
      })),
    ]);
    setSaved(false);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <p className="text-sm text-muted">
        결과물 사진은{" "}
        <b className="font-medium text-ink">기존 평가 세션(등록번호)</b>에
        추가합니다. 한 세션에 사진을 여러 장 붙일 수 있습니다.
      </p>

      <div className="grid gap-4 lg:grid-cols-5">
        <aside className="lg:col-span-2">
          <section className="rounded-xl border border-line bg-surface p-4">
            <h2 className="text-sm font-semibold">평가 세션 선택</h2>
            <ul className="mt-3 max-h-[28rem] space-y-1.5 overflow-y-auto">
              {sessions.map((s) => {
                const w = workers.find((x) => x.id === s.workerId);
                const c = mediaCounts(s);
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSessionId(s.id);
                        setAdded([]);
                        setSaved(false);
                      }}
                      className={`w-full rounded-md border px-2.5 py-2 text-left text-xs ${
                        sessionId === s.id
                          ? "border-brand bg-brand-soft/40"
                          : "border-line hover:bg-bg"
                      }`}
                    >
                      <p className="font-mono text-[11px] font-semibold text-brand">
                        {s.regNo}
                      </p>
                      <p className="font-medium">
                        {w?.name} · {s.skill}
                      </p>
                      <p className="text-muted">
                        {s.examDate} · 영상 {c.videos} · 사진 {c.products}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </aside>

        <form
          className="space-y-4 rounded-xl border border-line bg-surface p-5 lg:col-span-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!added.length) {
              alert("추가할 사진을 선택해 주세요.");
              return;
            }
            setSaved(true);
          }}
        >
          <h2 className="text-sm font-semibold">세션에 조형물 사진 추가</h2>

          {session && worker ? (
            <div className="rounded-lg border border-line bg-bg px-3 py-2.5 text-xs">
              <p className="font-mono font-semibold text-brand">{session.regNo}</p>
              <p className="mt-1 text-ink">
                {worker.name} · {session.skill} · {session.examDate}
              </p>
              <p className="mt-1 text-muted">
                현재 영상 {counts.videos} · 사진 {counts.products}
                {session.skillScore != null
                  ? ` · 점수 ${session.skillScore}`
                  : ""}
              </p>
              <div className="mt-2 border-t border-line pt-2">
                <p className="mb-1 font-medium text-ink">세션 미디어</p>
                <ul className="max-h-36 space-y-0.5 overflow-y-auto text-muted">
                  {session.media.map((m) => (
                    <li key={m.id} className="truncate">
                      [{m.kind === "video" ? "영상" : "사진"}] {m.name}
                      {m.videoId ? ` · ${m.videoId}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ["product_ref", "기준 샘플"],
                ["product_candidate", "작업자 결과"],
                ["product_other", "추가 사진"],
              ] as const
            ).map(([kind, label]) => (
              <label
                key={kind}
                className="cursor-pointer rounded-md border border-line px-2.5 py-1.5 text-xs hover:bg-bg"
              >
                {label} 추가
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    addFiles(e.target.files, kind);
                    e.target.value = "";
                  }}
                />
              </label>
            ))}
          </div>

          {added.length ? (
            <ul className="space-y-1 text-xs">
              {added.map((m) => (
                <li
                  key={m.id}
                  className="flex justify-between gap-2 rounded bg-bg px-2 py-1.5"
                >
                  <span className="truncate">
                    {m.kind === "product_ref"
                      ? "기준"
                      : m.kind === "product_candidate"
                        ? "결과"
                        : "추가"}{" "}
                    · {m.name}
                  </span>
                  <button
                    type="button"
                    className="text-danger hover:underline"
                    onClick={() =>
                      setAdded((prev) => prev.filter((x) => x.id !== m.id))
                    }
                  >
                    제거
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-xs text-muted">
              여러 장을 한 번에 선택해 추가할 수 있습니다.
            </p>
          )}

          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <Link
              href="/register/"
              className="rounded-lg border border-line px-3 py-2 text-sm"
            >
              새 세션
            </Link>
            <button
              type="submit"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white"
            >
              세션에 첨부
            </button>
          </div>
          {saved && session ? (
            <p className="text-center text-xs text-ok">
              {session.regNo}에 사진 {added.length}장 추가됨 (프로토타입).{" "}
              <Link
                href={`/workers/${session.workerId}/`}
                className="text-brand hover:underline"
              >
                이력 보기
              </Link>
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
