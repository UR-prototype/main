"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { jobs, workers } from "@/data/mock";

export default function RegisterProductPage() {
  const [workerId, setWorkerId] = useState(workers[0]?.id ?? "W-001");
  const [videoId, setVideoId] = useState(() => {
    const first = jobs.find((j) => j.workerId === (workers[0]?.id ?? "W-001"));
    return first?.videoId ?? jobs[0]?.videoId ?? "";
  });
  const [refName, setRefName] = useState<string | null>(null);
  const [candidateName, setCandidateName] = useState<string | null>(null);
  const [extraCount, setExtraCount] = useState(0);
  const [saved, setSaved] = useState(false);

  const worker = workers.find((w) => w.id === workerId);
  const workerJobs = useMemo(
    () => jobs.filter((j) => j.workerId === workerId),
    [workerId],
  );
  const selectedJob = workerJobs.find((j) => j.videoId === videoId) ?? workerJobs[0];

  function onWorkerChange(id: string) {
    setWorkerId(id);
    const next = jobs.find((j) => j.workerId === id);
    setVideoId(next?.videoId ?? "");
    setSaved(false);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <p className="text-sm text-muted">
        조형물 이미지도 <b className="font-medium text-ink">기술자 → 영상</b>{" "}
        순으로 묶습니다. Other Photos는 해당 Skills Verification 건에 첨부됩니다.
      </p>

      <div className="grid gap-4 lg:grid-cols-5">
        <aside className="space-y-3 lg:col-span-2">
          <section className="rounded-xl border border-line bg-surface p-4">
            <h2 className="text-sm font-semibold">1. 기술자</h2>
            <label className="mt-3 block text-sm">
              <span className="mb-1 block text-xs text-muted">누구의 결과물인가</span>
              <select
                value={workerId}
                onChange={(e) => onWorkerChange(e.target.value)}
                className="w-full rounded-lg border border-line bg-bg px-3 py-2"
              >
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} · {w.id}
                  </option>
                ))}
              </select>
            </label>
            {worker ? (
              <div className="mt-3 rounded-lg bg-bg px-3 py-2 text-xs text-muted">
                <p className="font-medium text-ink">{worker.name}</p>
                <p>
                  {worker.skill} · 영상 {workerJobs.length}건
                </p>
                <Link
                  href={`/workers/${worker.id}/`}
                  className="mt-1 inline-block text-brand hover:underline"
                >
                  프로필
                </Link>
              </div>
            ) : null}
          </section>

          <section className="rounded-xl border border-line bg-surface p-4">
            <h2 className="text-sm font-semibold">2. 연결 영상</h2>
            {workerJobs.length === 0 ? (
              <p className="mt-2 text-xs text-muted">
                이 기술자에 영상이 없습니다.{" "}
                <Link href="/register/" className="text-brand hover:underline">
                  영상 먼저 등록
                </Link>
              </p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {workerJobs.map((j) => (
                  <li key={j.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setVideoId(j.videoId);
                        setSaved(false);
                      }}
                      className={`w-full rounded-md border px-2.5 py-2 text-left text-xs ${
                        videoId === j.videoId
                          ? "border-brand bg-brand-soft/40"
                          : "border-line hover:bg-bg"
                      }`}
                    >
                      <p className="font-medium">{j.videoId}</p>
                      <p className="truncate text-muted">{j.videoName}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>

        <form
          className="space-y-4 rounded-xl border border-line bg-surface p-5 lg:col-span-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!selectedJob) {
              alert("연결할 영상이 없습니다.");
              return;
            }
            if (!refName && !candidateName) {
              alert("기준 또는 결과 조형물 이미지를 선택해 주세요.");
              return;
            }
            setSaved(true);
          }}
        >
          <h2 className="text-sm font-semibold">3. 조형물 이미지</h2>

          <div className="rounded-lg border border-line bg-bg px-3 py-2 text-xs">
            <p className="font-semibold text-ink">첨부 대상 묶음</p>
            <p className="mt-1 text-muted">
              {worker?.name} ({workerId})
              {" → "}
              {selectedJob
                ? `${selectedJob.videoId} · ${selectedJob.videoName}`
                : "영상 미선택"}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-xs text-muted">기준 샘플</span>
              <input
                type="file"
                accept="image/*"
                className="w-full rounded-lg border border-dashed border-line bg-bg px-3 py-6 text-xs"
                onChange={(e) =>
                  setRefName(e.target.files?.[0]?.name ?? null)
                }
              />
              {refName ? (
                <p className="mt-1 text-[11px] text-muted">{refName}</p>
              ) : null}
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs text-muted">
                결과 조형물 (작업자 산출)
              </span>
              <input
                type="file"
                accept="image/*"
                className="w-full rounded-lg border border-dashed border-line bg-bg px-3 py-6 text-xs"
                onChange={(e) =>
                  setCandidateName(e.target.files?.[0]?.name ?? null)
                }
              />
              {candidateName ? (
                <p className="mt-1 text-[11px] text-muted">{candidateName}</p>
              ) : null}
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block text-xs text-muted">추가 사진 (선택)</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="w-full text-xs"
              onChange={(e) => setExtraCount(e.target.files?.length ?? 0)}
            />
            {extraCount > 0 ? (
              <p className="mt-1 text-[11px] text-muted">{extraCount}장</p>
            ) : null}
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-xs text-muted">육안 메모</span>
            <textarea
              rows={2}
              placeholder="정렬, 표면, 치수 등"
              className="w-full resize-none rounded-lg border border-line bg-bg px-3 py-2"
            />
          </label>

          <div className="rounded-lg border border-line bg-bg px-3 py-2.5 text-xs text-muted">
            <p className="font-semibold text-ink">등록 예정</p>
            <ul className="mt-1 space-y-0.5">
              <li>
                소유자: {worker?.name} · 영상 {selectedJob?.videoId ?? "—"}
              </li>
              <li>기준: {refName ?? "—"}</li>
              <li>결과: {candidateName ?? "—"}</li>
              <li>추가: {extraCount}장</li>
            </ul>
          </div>

          <div className="flex justify-end border-t border-line pt-4">
            <button
              type="submit"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white"
            >
              {worker?.name} 영상에 조형물 첨부
            </button>
          </div>
          {saved ? (
            <p className="text-center text-xs text-ok">
              {worker?.name} / {selectedJob?.videoId} 묶음에 등록됨.{" "}
              <Link
                href="/labeling/product/"
                className="text-brand hover:underline"
              >
                좌표 라벨링
              </Link>
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
