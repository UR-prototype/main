"use client";

import { useState } from "react";
import { jobs, workers } from "@/data/mock";

export default function RegisterProductPage() {
  const [saved, setSaved] = useState(false);
  const completed = jobs.filter((j) => j.status === "completed" || j.status === "uploaded");

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <p className="text-sm text-muted">
        결과 <b className="font-medium text-ink">조형물(완성품) 이미지</b>를 영상에
        연결해 등록합니다. 이후 조형물 좌표 라벨링에서 문제 구간을 표시합니다.
      </p>

      <form
        className="space-y-4 rounded-xl border border-line bg-surface p-5"
        onSubmit={(e) => {
          e.preventDefault();
          setSaved(true);
        }}
      >
        <h2 className="text-sm font-semibold">조형물 이미지 등록</h2>

        <label className="block text-sm">
          <span className="mb-1 block text-xs text-muted">연결 영상</span>
          <select className="w-full rounded-lg border border-line bg-bg px-3 py-2">
            {jobs.map((j) => {
              const w = workers.find((x) => x.id === j.workerId);
              return (
                <option key={j.id} value={j.videoId}>
                  {j.videoId} · {w?.name} · {j.jobType}
                </option>
              );
            })}
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-muted">기준 샘플 이미지</span>
            <input
              type="file"
              accept="image/*"
              className="w-full rounded-lg border border-dashed border-line bg-bg px-3 py-6 text-xs"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-muted">결과 조형물 이미지</span>
            <input
              type="file"
              accept="image/*"
              className="w-full rounded-lg border border-dashed border-line bg-bg px-3 py-6 text-xs"
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-xs text-muted">추가 사진 (선택)</span>
          <input type="file" accept="image/*" multiple className="w-full text-xs" />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-xs text-muted">육안 메모</span>
          <textarea
            rows={2}
            placeholder="정렬, 표면, 치수 등 1차 관찰"
            className="w-full resize-none rounded-lg border border-line bg-bg px-3 py-2"
          />
        </label>

        <div className="flex justify-end border-t border-line pt-4">
          <button
            type="submit"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white"
          >
            조형물 등록
          </button>
        </div>
        {saved ? (
          <p className="text-center text-xs text-ok">
            등록되었습니다. 라벨링 → 조형물 좌표에서 문제점을 표시하세요.
          </p>
        ) : null}
      </form>

      <p className="text-xs text-muted">
        참고: 완료·업로드 건 {completed.length}건이 연결 대상으로 표시됩니다.
      </p>
    </div>
  );
}
