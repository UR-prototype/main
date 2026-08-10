"use client";

import { LabelingMediaBrowser } from "@/components/LabelingMediaBrowser";

export default function LabelingLibraryPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold">라벨링 미디어 목록</h2>
        <p className="mt-1 text-sm text-muted">
          평가 세션에 묶인{" "}
          <b className="font-medium text-ink">전체 영상·이미지</b>를 사람·세션·유형으로
          걸러 보고, 항목을 누르면 바로 타임라인 또는 조형물 좌표 라벨링으로
          이동합니다.
        </p>
      </div>
      <LabelingMediaBrowser mode="full" />
    </div>
  );
}
