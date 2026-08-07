import type { PipelineStatus } from "@/data/mock";
import { PIPELINE_STEPS } from "@/data/mock";

export function statusLabel(status: PipelineStatus) {
  switch (status) {
    case "uploaded":
      return "업로드됨";
    case "queued":
      return "대기열";
    case "preprocessing":
      return "전처리";
    case "pose_extraction":
      return "포즈추출";
    case "analyzing":
      return "Feature분석";
    case "scoring":
      return "점수산출";
    case "completed":
      return "완료";
    case "failed":
      return "실패";
  }
}

export function statusClass(status: PipelineStatus) {
  switch (status) {
    case "uploaded":
    case "queued":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "preprocessing":
    case "pose_extraction":
    case "analyzing":
    case "scoring":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "failed":
      return "bg-red-50 text-red-700 border-red-200";
  }
}

export function pipelineIndex(status: PipelineStatus) {
  if (status === "failed") return -1;
  return PIPELINE_STEPS.indexOf(status);
}

export function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
