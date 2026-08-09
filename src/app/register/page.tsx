"use client";

import { useState } from "react";
import { workers, type JobType } from "@/data/mock";

const trades: JobType[] = ["금형조립", "기계가공", "사출", "프레스", "용접"];

export default function RegisterVideoPage() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <p className="text-sm text-muted">
        객체·포즈 라벨링은 <b className="font-medium text-ink">외부에서 별도 진행</b> 후
        전달받습니다. 아래 창에 영상과 인수 정보를 등록합니다.
      </p>

      <form
        className="space-y-4 rounded-xl border border-line bg-surface p-5"
        onSubmit={(e) => {
          e.preventDefault();
          setSaved(true);
        }}
      >
        <h2 className="text-sm font-semibold">영상 · 기본 정보</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-muted">기술자</span>
            <select className="w-full rounded-lg border border-line bg-bg px-3 py-2" defaultValue="W-001">
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.id})
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-muted">직종</span>
            <select className="w-full rounded-lg border border-line bg-bg px-3 py-2" defaultValue="금형조립">
              {trades.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>

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
            객체 라벨링 · 포즈 라벨링 결과 파일을 함께 등록합니다.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-xs text-muted">객체 라벨 (JSON/COCO 등)</span>
              <input type="file" accept=".json,.xml,.csv" className="w-full text-xs" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs text-muted">포즈 라벨 (JSON 등)</span>
              <input type="file" accept=".json,.csv" className="w-full text-xs" />
            </label>
          </div>
          <label className="mt-3 block text-sm">
            <span className="mb-1 block text-xs text-muted">인수 메모</span>
            <textarea
              rows={2}
              placeholder="전달 일자, 라벨링 업체, 버전 등"
              className="w-full resize-none rounded-lg border border-line bg-surface px-3 py-2"
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-xs text-muted">촬영·공정 메모</span>
          <textarea
            rows={2}
            className="w-full resize-none rounded-lg border border-line bg-bg px-3 py-2"
            placeholder="공정, 공구, 특이사항"
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
          <p className="text-center text-xs text-ok">
            등록되었습니다. (프로토타입) 이어서 조형물 이미지·내부 라벨링을 진행하세요.
          </p>
        ) : null}
      </form>
    </div>
  );
}
