"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  assessmentSessions,
  getSessionsByWorker,
  mediaCounts,
  suggestRegNo,
  workers,
  type JobType,
  type SessionMedia,
} from "@/data/mock";
import {
  NCS_MOLD_ASSY,
  NCS_SAFETY,
  SCENARIO_MOLD,
} from "@/data/ncs";

const trades: JobType[] = ["금형조립", "기계가공", "사출", "프레스", "용접"];

function today() {
  return "2026-06-20";
}

export default function RegisterSessionPage() {
  const [workerId, setWorkerId] = useState(workers[0]?.id ?? "W-001");
  const [skill, setSkill] = useState<JobType>(workers[0]?.skill ?? "금형조립");
  const [examDate, setExamDate] = useState(today());
  const [regNo, setRegNo] = useState(() =>
    suggestRegNo(today(), workers[0]?.id ?? "W-001"),
  );
  const [scenarioId, setScenarioId] = useState<string>(SCENARIO_MOLD.id);
  const [videos, setVideos] = useState<SessionMedia[]>([]);
  const [products, setProducts] = useState<SessionMedia[]>([]);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [createdReg, setCreatedReg] = useState<string | null>(null);

  const worker = workers.find((w) => w.id === workerId);
  const existing = useMemo(
    () => getSessionsByWorker(workerId),
    [workerId],
  );

  function refreshReg(nextWorker = workerId, nextDate = examDate) {
    setRegNo(suggestRegNo(nextDate, nextWorker));
  }

  function addVideos(files: FileList | null) {
    if (!files?.length) return;
    const next: SessionMedia[] = Array.from(files).map((f, i) => ({
      id: `local-v-${Date.now()}-${i}`,
      kind: "video" as const,
      name: f.name,
    }));
    setVideos((prev) => [...prev, ...next]);
    setSaved(false);
  }

  function addProducts(
    files: FileList | null,
    kind: "product_ref" | "product_candidate" | "product_other",
  ) {
    if (!files?.length) return;
    const next: SessionMedia[] = Array.from(files).map((f, i) => ({
      id: `local-p-${Date.now()}-${i}`,
      kind,
      name: f.name,
    }));
    setProducts((prev) => [...prev, ...next]);
    setSaved(false);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <p className="text-sm text-muted">
        숙련도 평가는{" "}
        <b className="font-medium text-ink">
          사람 × 평가 기술 × 일자 × 등록번호
        </b>
        로 한 세션을 만듭니다. 세션 안에 영상·결과물 사진을{" "}
        <b className="font-medium text-ink">여러 개</b> 넣을 수 있습니다.
      </p>

      <div className="grid gap-4 lg:grid-cols-12">
        <aside className="space-y-3 lg:col-span-4">
          <section className="rounded-xl border border-line bg-surface p-4">
            <h2 className="text-sm font-semibold">이 기술자의 평가 이력</h2>
            {worker ? (
              <p className="mt-1 text-xs text-muted">
                {worker.name} · 세션 {existing.length}회
              </p>
            ) : null}
            <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto">
              {existing.map((s) => {
                const c = mediaCounts(s);
                return (
                  <li
                    key={s.id}
                    className="rounded-lg border border-line bg-bg px-2.5 py-2 text-xs"
                  >
                    <p className="font-mono text-[11px] font-semibold text-brand">
                      {s.regNo}
                    </p>
                    <p className="mt-0.5 font-medium text-ink">
                      {s.skill} · {s.examDate}
                    </p>
                    <p className="text-muted">
                      영상 {c.videos} · 사진 {c.products}
                      {s.skillScore != null ? ` · ${s.skillScore}점` : ""}
                    </p>
                    <Link
                      href={`/workers/${s.workerId}/`}
                      className="mt-1 inline-block text-brand hover:underline"
                    >
                      상세
                    </Link>
                  </li>
                );
              })}
              {!existing.length ? (
                <li className="py-4 text-center text-xs text-muted">
                  아직 평가 세션 없음
                </li>
              ) : null}
            </ul>
          </section>
        </aside>

        <form
          className="space-y-4 rounded-xl border border-line bg-surface p-5 lg:col-span-8"
          onSubmit={(e) => {
            e.preventDefault();
            if (!videos.length) {
              alert("최소 1개 영상을 추가해 주세요.");
              return;
            }
            if (assessmentSessions.some((s) => s.regNo === regNo)) {
              alert("이미 있는 등록번호입니다. 등록번호를 바꿔 주세요.");
              return;
            }
            setCreatedReg(regNo);
            setSaved(true);
          }}
        >
          <h2 className="text-sm font-semibold">새 숙련도 평가 세션</h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-xs text-muted">기술자</span>
              <select
                value={workerId}
                onChange={(e) => {
                  const id = e.target.value;
                  setWorkerId(id);
                  const w = workers.find((x) => x.id === id);
                  if (w) setSkill(w.skill);
                  refreshReg(id, examDate);
                  setSaved(false);
                }}
                className="w-full rounded-lg border border-line bg-bg px-3 py-2"
              >
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.id})
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs text-muted">
                평가 기술 (숙련도 시험 직종)
              </span>
              <select
                value={skill}
                onChange={(e) => setSkill(e.target.value as JobType)}
                className="w-full rounded-lg border border-line bg-bg px-3 py-2"
              >
                {trades.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs text-muted">시험 일자</span>
              <input
                type="date"
                value={examDate}
                onChange={(e) => {
                  setExamDate(e.target.value);
                  refreshReg(workerId, e.target.value);
                  setSaved(false);
                }}
                className="w-full rounded-lg border border-line bg-bg px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs text-muted">등록번호</span>
              <input
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                className="w-full rounded-lg border border-line bg-bg px-3 py-2 font-mono text-sm"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block text-xs text-muted">시나리오</span>
              <select
                value={scenarioId}
                onChange={(e) => setScenarioId(e.target.value)}
                className="w-full rounded-lg border border-line bg-bg px-3 py-2"
              >
                <option value={SCENARIO_MOLD.id}>{SCENARIO_MOLD.title}</option>
                <option value="SC_MACHINING_L1_01">기계가공 · 측정·가공</option>
              </select>
            </label>
          </div>

          {skill === "금형조립" ? (
            <p className="rounded-md bg-bg px-3 py-2 text-[11px] text-muted">
              NCS {NCS_MOLD_ASSY.code} · {NCS_SAFETY.code}
            </p>
          ) : null}

          <section className="rounded-lg border border-line p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold">
                영상 (여러 개 가능) · {videos.length}개
              </h3>
              <label className="cursor-pointer rounded-md border border-line px-2 py-1 text-[11px] hover:bg-bg">
                영상 추가
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    addVideos(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            {videos.length ? (
              <ul className="space-y-1 text-xs">
                {videos.map((v) => (
                  <li
                    key={v.id}
                    className="flex items-center justify-between gap-2 rounded bg-bg px-2 py-1.5"
                  >
                    <span className="truncate">{v.name}</span>
                    <button
                      type="button"
                      className="shrink-0 text-danger hover:underline"
                      onClick={() =>
                        setVideos((prev) => prev.filter((x) => x.id !== v.id))
                      }
                    >
                      제거
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-4 text-center text-[11px] text-muted">
                예: 정면 + 측면 촬영본을 같은 세션에 함께 등록
              </p>
            )}
          </section>

          <section className="rounded-lg border border-line p-3">
            <h3 className="mb-2 text-xs font-semibold">
              결과물 사진 (여러 개 가능) · {products.length}개
            </h3>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {(
                [
                  ["product_ref", "기준 샘플"],
                  ["product_candidate", "작업자 결과"],
                  ["product_other", "추가 사진"],
                ] as const
              ).map(([kind, label]) => (
                <label
                  key={kind}
                  className="cursor-pointer rounded-md border border-line px-2 py-1 text-[11px] hover:bg-bg"
                >
                  {label} 추가
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      addProducts(e.target.files, kind);
                      e.target.value = "";
                    }}
                  />
                </label>
              ))}
            </div>
            {products.length ? (
              <ul className="space-y-1 text-xs">
                {products.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-2 rounded bg-bg px-2 py-1.5"
                  >
                    <span className="truncate">
                      <span className="text-muted">
                        {p.kind === "product_ref"
                          ? "기준"
                          : p.kind === "product_candidate"
                            ? "결과"
                            : "추가"}
                        ·{" "}
                      </span>
                      {p.name}
                    </span>
                    <button
                      type="button"
                      className="shrink-0 text-danger hover:underline"
                      onClick={() =>
                        setProducts((prev) =>
                          prev.filter((x) => x.id !== p.id),
                        )
                      }
                    >
                      제거
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-3 text-center text-[11px] text-muted">
                기준·후보·결함 사진 등 복수 첨부 가능
              </p>
            )}
          </section>

          <label className="block text-sm">
            <span className="mb-1 block text-xs text-muted">메모</span>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full resize-none rounded-lg border border-line bg-bg px-3 py-2"
              placeholder="촬영 각도, SOP, 특이사항"
            />
          </label>

          <div className="rounded-lg border border-brand/25 bg-brand-soft/30 px-3 py-2.5 text-xs">
            <p className="font-semibold text-ink">세션 묶음 미리보기</p>
            <ul className="mt-1 space-y-0.5 text-muted">
              <li>
                {worker?.name} ({workerId}) · {skill} · {examDate}
              </li>
              <li className="font-mono text-ink">{regNo}</li>
              <li>
                영상 {videos.length} · 사진 {products.length} · {scenarioId}
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
            <Link
              href="/register/product/"
              className="rounded-lg border border-line px-3 py-2 text-sm"
            >
              기존 세션에 사진 추가
            </Link>
            <button
              type="submit"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white"
            >
              평가 세션 등록
            </button>
          </div>
          {saved ? (
            <p className="text-center text-xs text-ok">
              세션 {createdReg} 등록됨 (프로토타입).{" "}
              <Link
                href={`/workers/${workerId}/`}
                className="text-brand hover:underline"
              >
                기술자 이력에서 확인
              </Link>
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
