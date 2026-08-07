"use client";

export function UploadButton() {
  return (
    <button
      type="button"
      className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white"
      onClick={() => alert("영상 업로드 창을 엽니다. (프로토타입)")}
    >
      영상 업로드
    </button>
  );
}
