"use client";

import { useEffect, useId, useState } from "react";
import { Upload, X } from "lucide-react";
import { jobTypes, workers, type JobType } from "@/data/mock";

const trades = [
  "금형조립",
  "기계가공",
  "사출",
  "프레스",
  "용접",
] as JobType[];

export function UploadModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const titleId = useId();
  const [workerId, setWorkerId] = useState(workers[0]?.id ?? "");
  const [jobType, setJobType] = useState<JobType>("금형조립");
  const [fileName, setFileName] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [fps, setFps] = useState(5);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) {
      setFileName(null);
      setNote("");
      setFps(5);
      setDone(false);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const worker = workers.find((w) => w.id === workerId);
  const supported = jobTypes.find((j) => j.id === jobType)?.supported;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!fileName) {
      alert("영상 파일을 선택해 주세요.");
      return;
    }
    setDone(true);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-line bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 id={titleId} className="text-base font-semibold">
              작업 영상 업로드
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              기술자·직종을 지정한 뒤 분석 대기열에 등록합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted hover:bg-bg hover:text-ink"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </div>

        {done ? (
          <div className="space-y-4 px-5 py-8 text-center">
            <p className="text-sm font-medium text-ink">업로드 요청이 등록되었습니다.</p>
            <p className="text-xs text-muted">
              {worker?.name} · {jobType}
              {fileName ? ` · ${fileName}` : ""}
              <br />
              샘플링 {fps} fps · 작업·분석 → 진행·검토 탭에서 상태를 확인할 수 있습니다.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white"
            >
              확인
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 px-5 py-5">
            <label className="block text-sm">
              <span className="mb-1 block text-xs text-muted">기술자</span>
              <select
                value={workerId}
                onChange={(e) => {
                  const id = e.target.value;
                  setWorkerId(id);
                  const w = workers.find((x) => x.id === id);
                  if (w) setJobType(w.skill);
                }}
                className="w-full rounded-lg border border-line bg-bg px-3 py-2"
              >
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.id}) · {w.skill}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-xs text-muted">직종</span>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value as JobType)}
                className="w-full rounded-lg border border-line bg-bg px-3 py-2"
              >
                {trades.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {supported === false ? (
                <p className="mt-1 text-[11px] text-warn">
                  이 직종은 분석 모델 준비 중입니다. 업로드는 가능하나 결과는 제한될 수 있습니다.
                </p>
              ) : null}
            </label>

            <div>
              <span className="mb-1 block text-xs text-muted">영상 파일</span>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line bg-bg px-4 py-8 text-center transition hover:border-brand/50 hover:bg-brand-soft/30">
                <Upload size={22} className="text-brand" />
                <span className="mt-2 text-sm font-medium">
                  {fileName ?? "클릭하여 파일 선택"}
                </span>
                <span className="mt-1 text-[11px] text-muted">
                  MP4 · MOV · 권장 1080p · 최대 500MB (프로토타입)
                </span>
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) =>
                    setFileName(e.target.files?.[0]?.name ?? null)
                  }
                />
              </label>
            </div>

            <label className="block text-sm">
              <span className="mb-1 block text-xs text-muted">
                분석 샘플링 FPS{" "}
                <span className="text-muted/70">(SSLO 프레임 추출 옵션)</span>
              </span>
              <select
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                className="w-full rounded-lg border border-line bg-bg px-3 py-2"
              >
                {[1, 2, 5, 10, 15, 30].map((n) => (
                  <option key={n} value={n}>
                    {n} fps
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-muted">
                낮을수록 처리 부담↓ · 자세 근거는 핵심 구간 프레임으로 추출합니다.
              </p>
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-xs text-muted">메모 (선택)</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="촬영 조건, 공정 메모 등"
                className="w-full resize-none rounded-lg border border-line bg-bg px-3 py-2"
              />
            </label>

            <div className="flex justify-end gap-2 border-t border-line pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-line px-4 py-2 text-sm"
              >
                취소
              </button>
              <button
                type="submit"
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white"
              >
                업로드 · 분석 요청
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
