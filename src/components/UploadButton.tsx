"use client";

import { useUploadModal } from "@/components/UploadProvider";

export function UploadButton() {
  const { openUpload } = useUploadModal();
  return (
    <button
      type="button"
      onClick={openUpload}
      className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white"
    >
      영상 업로드
    </button>
  );
}
