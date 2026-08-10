"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { jobs, workers, type JobType } from "@/data/mock";
import {
  NCS_MOLD_ASSY,
  NCS_SAFETY,
  SCENARIO_MOLD,
} from "@/data/ncs";

const trades: JobType[] = ["금형조립", "기계가공", "사출", "프레스", "용접"];

export default function RegisterVideoPage() {
  const [workerId, setWorkerId] = useState(workers[0]?.id ?? "W-001");
  const [trade, setTrade] = useState<JobType>(workers[0]?.skill ?? "금형조립");
  const [videoKind, setVideoKind] = useState<
    "skills_verification" | "experience"
  >("skills_verification");
  const [scenarioId, setScenarioId] = useState<string>(SCENARIO_MOLD.id);
  const [videoName, setVideoName] = useState<string | null>(null);
  const [objectLabel, setObjectLabel] = useState<string | null>(null);
  const [poseLabel, setPoseLabel] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const worker = workers.find((w) => w.id === workerId);
  const workerJobs = useMemo(
    () => jobs.filter((j) => j.workerId === workerId),
    [workerId],
  );

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <p className="text-sm text-muted">
        업로드는 반드시 <b className="font-medium text-ink">기술자 프로필</b>에
        묶입니다. 영상·외부 라벨은 해당 인력의 1 Record로 등록됩니다.
      </p>

      <div className="grid gap-4 lg:grid-cols-5">
        <aside className="space-y-3 lg:col-span-2">
          <section className="rounded-xl border border-line bg-surface p-4">
            <h2 className="text-sm font-semibold">1. 기술자 (소유자)</h2>
            <label className="mt-3 block text-sm">
              <span className="mb-1 block text-xs text-muted">누구의 영상인가</span>
              <select
                value={workerId}
                onChange={(e) => {
                  const id = e.target.value;
                  setWorkerId(id);
                  const w = workers.find((x) => x.id === id);
                  if (w) setTrade(w.skill);
                  setSaved(false);
                }}
                className="w-full rounded-lg border border-line bg-bg px-3 py-2"
              >
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} · {w.id} · {w.skill}
                  </option>
                ))}
              </select>
            </label>

            {worker ? (
              <div className="mt-3 rounded-lg border border-brand/20 bg-brand-soft/30 px-3 py-2.5 text-xs">
                <p className="font-semibold text-ink">{worker.name}</p>
                <p className="mt-0.5 text-muted">
                  {worker.id} · {worker.nationality} · {worker.skill}
                </p>
                <p className="mt-0.5 text-muted">
                  {worker.company} · {worker.agency}
                </p>
                <p className="mt-1 text-muted">
                  기존 영상 {workerJobs.length}건
                  {worker.latestScore != null
                    ? ` · 최근 ${worker.latestScore}점`
                    : ""}
                </p>
                <Link
                  href={`/workers/${worker.id}/`}
                  className="mt-2 inline-block text-brand hover:underline"
                >
                  프로필 보기
                </Link>
              </div>
            ) : null}
          </section>

          <section className="rounded-xl border border-line bg-surface p-4">
            <h2 className="text-sm font-semibold">이 기술자 기존 묶음</h2>
            {workerJobs.length === 0 ? (
              <p className="mt-2 text-xs text-muted">등록된 영상 없음</p>
            ) : (
              <ul className="mt-2 max-h-48 space-y-1.5 overflow-y-auto text-xs">
                {workerJobs.map((j) => (
                  <li
                    key={j.id}
                    className="rounded-md border border-line bg-bg px-2 py-1.5"
                  >
                    <p className="font-medium">{j.videoId}</p>
                    <p className="truncate text-muted">
                      {j.videoName} · {j.jobType}
                    </p>
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
            if (!videoName) {
              alert("작업 영상을 선택해 주세요.");
              return;
            }
            setSaved(true);
          }}
        >
          <h2 className="text-sm font-semibold">2. 영상 · 라벨 (묶음에 추가)</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-xs text-muted">직종</span>
              <select
                className="w-full rounded-lg border border-line bg-bg px-3 py-2"
                value={trade}
                onChange={(e) => setTrade(e.target.value as JobType)}
              >
                {trades.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs text-muted">영상 유형</span>
              <select
                className="w-full rounded-lg border border-line bg-bg px-3 py-2"
                value={videoKind}
                onChange={(e) =>
                  setVideoKind(
                    e.target.value as "skills_verification" | "experience",
                  )
                }
              >
                <option value="skills_verification">
                  Skills Verification (기량검증)
                </option>
                <option value="experience">Experience Video (경험)</option>
              </select>
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block text-xs text-muted">시나리오</span>
              <select
                className="w-full rounded-lg border border-line bg-bg px-3 py-2"
                value={scenarioId}
                onChange={(e) => setScenarioId(e.target.value)}
              >
                <option value={SCENARIO_MOLD.id}>{SCENARIO_MOLD.title}</option>
                <option value="SC_MACHINING_L1_01">기계가공 · 측정·가공</option>
              </select>
            </label>
          </div>

          {trade === "금형조립" ? (
            <div className="rounded-lg border border-line bg-bg px-3 py-2 text-xs text-muted">
              NCS ·{" "}
              <span className="font-medium text-ink">{NCS_MOLD_ASSY.code}</span>{" "}
              {NCS_MOLD_ASSY.title}
              {" · "}
              <span className="font-medium text-ink">{NCS_SAFETY.code}</span>
            </div>
          ) : null}

          <label className="block text-sm">
            <span className="mb-1 block text-xs text-muted">
              작업 영상 → {worker?.name ?? "기술자"} 묶음
            </span>
            <input
              type="file"
              accept="video/*"
              className="w-full rounded-lg border border-dashed border-line bg-bg px-3 py-8 text-sm"
              onChange={(e) =>
                setVideoName(e.target.files?.[0]?.name ?? null)
              }
            />
            {videoName ? (
              <p className="mt-1 text-[11px] text-muted">선택: {videoName}</p>
            ) : null}
          </label>

          <div className="rounded-lg border border-brand/20 bg-brand-soft/40 p-4">
            <h3 className="text-sm font-semibold text-brand">
              외부 라벨 인수 (같은 기술자·영상에 첨부)
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block text-xs text-muted">객체 라벨</span>
                <input
                  type="file"
                  accept=".json,.xml,.csv"
                  className="w-full text-xs"
                  onChange={(e) =>
                    setObjectLabel(e.target.files?.[0]?.name ?? null)
                  }
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-xs text-muted">포즈 라벨</span>
                <input
                  type="file"
                  accept=".json,.csv"
                  className="w-full text-xs"
                  onChange={(e) =>
                    setPoseLabel(e.target.files?.[0]?.name ?? null)
                  }
                />
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-bg px-3 py-2.5 text-xs">
            <p className="font-semibold text-ink">등록 예정 묶음</p>
            <ul className="mt-1.5 space-y-0.5 text-muted">
              <li>
                기술자:{" "}
                <span className="font-medium text-ink">
                  {worker?.name} ({workerId})
                </span>
              </li>
              <li>
                영상:{" "}
                <span className="font-medium text-ink">
                  {videoName ?? "미선택"}
                </span>
              </li>
              <li>
                유형: {videoKind} · {trade} · {scenarioId}
              </li>
              <li>객체 라벨: {objectLabel ?? "—"}</li>
              <li>포즈 라벨: {poseLabel ?? "—"}</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <button
              type="submit"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white"
            >
              {worker?.name} 묶음으로 등록
            </button>
          </div>
          {saved ? (
            <p className="text-center text-xs text-ok">
              {worker?.name} 프로필에 영상 묶음이 등록되었습니다. (프로토타입)
              {" · "}
              <Link href={`/workers/${workerId}/`} className="text-brand hover:underline">
                확인
              </Link>
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
