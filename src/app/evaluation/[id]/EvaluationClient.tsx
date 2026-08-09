"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { getAnalysis, getJob, getWorker } from "@/data/mock";

const NCS_ITEMS = [
  {
    id: "ncs-1",
    code: "NCS-01",
    title: "작업 준비 및 안전",
    desc: "공구·치구 준비, 안전수칙 준수",
  },
  {
    id: "ncs-2",
    code: "NCS-02",
    title: "표준 공정 수행",
    desc: "공정 순서·사이클 준수",
  },
  {
    id: "ncs-3",
    code: "NCS-03",
    title: "정밀도·품질",
    desc: "치수·정렬·표면 품질",
  },
  {
    id: "ncs-4",
    code: "NCS-04",
    title: "이상 대응",
    desc: "이상 인지·조치·보고",
  },
];

export default function EvaluationClient() {
  const { id } = useParams<{ id: string }>();
  const job = getJob(id);
  const analysis = getAnalysis(id);
  const worker = job ? getWorker(job.workerId) : undefined;
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(NCS_ITEMS.map((i) => [i.id, 3])),
  );
  const [expertNote, setExpertNote] = useState("");
  const [level, setLevel] = useState<"초급" | "중급" | "고급">("중급");
  const [saved, setSaved] = useState(false);

  if (!job) {
    return (
      <AppShell title="숙련도 평가">
        <p className="text-sm text-muted">대상을 찾을 수 없습니다.</p>
      </AppShell>
    );
  }

  const ncsAvg =
    Object.values(scores).reduce((a, b) => a + b, 0) / NCS_ITEMS.length;

  return (
    <AppShell
      title="NCS · 전문가 평가"
      subtitle={`${worker?.name ?? job.workerId} · ${job.videoId} · ${job.jobType}`}
      actions={
        <div className="flex gap-2">
          <Link
            href={`/analysis/${id}/`}
            className="rounded-lg border border-line px-3 py-2 text-sm"
          >
            AI·라벨 참고
          </Link>
          <Link
            href="/evaluation/"
            className="rounded-lg border border-line px-3 py-2 text-sm"
          >
            목록
          </Link>
        </div>
      }
    >
      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        숙련도 확정은 <b>NCS 단위요소 + 전문가 의견</b> 기준입니다. AI 점수(
        {analysis?.skillScore ?? "—"})는 참고용입니다.
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <section className="space-y-3 lg:col-span-3">
          <h2 className="text-sm font-semibold">NCS 단위요소 (1–5)</h2>
          {NCS_ITEMS.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-line bg-surface p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-muted">{item.code}</p>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted">{item.desc}</p>
                </div>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={scores[item.id]}
                  onChange={(e) =>
                    setScores((prev) => ({
                      ...prev,
                      [item.id]: Number(e.target.value),
                    }))
                  }
                  className="w-16 rounded-lg border border-line bg-bg px-2 py-1.5 text-center text-sm"
                />
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-line bg-surface p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold">전문가 종합</h2>
          <p className="mt-2 text-xs text-muted">
            NCS 평균 <b className="text-ink">{ncsAvg.toFixed(1)}</b> / 5
          </p>

          <label className="mt-4 block text-sm">
            <span className="mb-1 block text-xs text-muted">숙련도 등급</span>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as typeof level)}
              className="w-full rounded-lg border border-line bg-bg px-3 py-2"
            >
              <option value="초급">초급</option>
              <option value="중급">중급</option>
              <option value="고급">고급</option>
            </select>
          </label>

          <label className="mt-3 block text-sm">
            <span className="mb-1 block text-xs text-muted">전문가 의견</span>
            <textarea
              value={expertNote}
              onChange={(e) => setExpertNote(e.target.value)}
              rows={6}
              placeholder="공정 준수, 개선 포인트, 배치 권고 등"
              className="w-full resize-none rounded-lg border border-line bg-bg px-3 py-2"
            />
          </label>

          {analysis ? (
            <div className="mt-4 rounded-lg bg-bg p-3 text-xs text-muted">
              <p>
                참고 · AI {analysis.skillScore}점 · {analysis.skillLevel}
              </p>
              <p className="mt-1">
                타임라인·조형물 라벨은 분석/라벨링 화면에서 확인
              </p>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setSaved(true)}
            className="mt-4 w-full rounded-lg bg-brand py-2.5 text-sm font-medium text-white"
          >
            NCS 평가 확정
          </button>
          {saved ? (
            <p className="mt-2 text-center text-xs text-ok">
              저장되었습니다. (프로토타입)
            </p>
          ) : null}
          <Link
            href={`/reports/${id}/`}
            className="mt-3 block text-center text-xs text-brand hover:underline"
          >
            평가서 보기
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
