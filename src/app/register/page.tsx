"use client";

import { useState } from "react";
import { workers, type JobType } from "@/data/mock";
import {
  NCS_MOLD_ASSY,
  NCS_SAFETY,
  SCENARIO_MOLD,
} from "@/data/ncs";

const trades: JobType[] = ["금형조립", "기계가공", "사출", "프레스", "용접"];

export default function RegisterVideoPage() {
  const [saved, setSaved] = useState(false);
  const [trade, setTrade] = useState<JobType>("금형조립");

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <p className="text-sm text-muted">
        객체·포즈 라벨은 <b className="font-medium text-ink">외부 인수</b>하고,
        내부에서는 Stage·Event·결과물·NCS 루브릭을 쌓습니다. 영상 1건 = 데이터
        정의서 1 Record.
      </p>

      <form
        className="space-y-4 rounded-xl border border-line bg-surface p-5"
        onSubmit={(e) => {
          e.preventDefault();
          setSaved(true);
        }}
      >
        <h2 className="text-sm font-semibold">영상 · 메타 (1 Record)</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-muted">기술자</span>
            <select
              className="w-full rounded-lg border border-line bg-bg px-3 py-2"
              defaultValue="W-001"
            >
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.id})
                </option>
              ))}
            </select>
          </label>
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
              defaultValue="skills_verification"
            >
              <option value="skills_verification">
                Skills Verification (기량검증)
              </option>
              <option value="experience">Experience Video (경험)</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-muted">시나리오</span>
            <select
              className="w-full rounded-lg border border-line bg-bg px-3 py-2"
              defaultValue={SCENARIO_MOLD.id}
            >
              <option value={SCENARIO_MOLD.id}>{SCENARIO_MOLD.title}</option>
              <option value="SC_MACHINING_L1_01">기계가공 · 측정·가공</option>
            </select>
          </label>
        </div>

        {trade === "금형조립" ? (
          <div className="rounded-lg border border-line bg-bg px-3 py-2 text-xs text-muted">
            NCS · <span className="font-medium text-ink">{NCS_MOLD_ASSY.code}</span>{" "}
            {NCS_MOLD_ASSY.title}
            {" · "}
            <span className="font-medium text-ink">{NCS_SAFETY.code}</span>{" "}
            {NCS_SAFETY.title}
            <p className="mt-1">
              Stage: PREP → FIXED_ASSY → MOVING_ASSY → CONFIRM → CLOSE
            </p>
          </div>
        ) : null}

        <label className="block text-sm">
          <span className="mb-1 block text-xs text-muted">작업 영상</span>
          <input
            type="file"
            accept="video/*"
            className="w-full rounded-lg border border-dashed border-line bg-bg px-3 py-8 text-sm"
          />
        </label>

        <div className="rounded-lg border border-brand/20 bg-brand-soft/40 p-4">
          <h3 className="text-sm font-semibold text-brand">외부 라벨 인수</h3>
          <p className="mt-1 text-xs text-muted">
            객체(YOLO 등) · 포즈(MediaPipe 등) 결과 파일. 내부 Stage/Event와
            별개로 인수합니다.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-xs text-muted">
                객체 라벨 (JSON/COCO)
              </span>
              <input type="file" accept=".json,.xml,.csv" className="w-full text-xs" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs text-muted">포즈 라벨 (JSON)</span>
              <input type="file" accept=".json,.csv" className="w-full text-xs" />
            </label>
          </div>
          <label className="mt-3 block text-sm">
            <span className="mb-1 block text-xs text-muted">인수 메모</span>
            <textarea
              rows={2}
              placeholder="전달 일자, 라벨링 업체, 버전"
              className="w-full resize-none rounded-lg border border-line bg-surface px-3 py-2"
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-xs text-muted">촬영·공정 메모</span>
          <textarea
            rows={2}
            className="w-full resize-none rounded-lg border border-line bg-bg px-3 py-2"
            placeholder="고정측/가동측 SOP, 공구, 특이사항"
          />
        </label>

        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <button
            type="submit"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white"
          >
            등록
          </button>
        </div>
        {saved ? (
          <p className="text-center text-xs text-ok">등록되었습니다. (프로토타입)</p>
        ) : null}
      </form>
    </div>
  );
}
