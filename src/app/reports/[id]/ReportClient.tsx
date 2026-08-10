"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { DeductionList } from "@/components/DeductionList";
import { EvidenceGallery } from "@/components/EvidenceGallery";
import { ExplainCard } from "@/components/ExplainCard";
import { MatchingCard } from "@/components/MatchingCard";
import { ProductJudgmentPanel } from "@/components/ProductJudgmentPanel";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import { SkillRadar } from "@/components/DashboardCharts";
import { StatusBadge } from "@/components/StatusBadge";
import {
  getAnalysis,
  getSession,
  getSessionPrimaryVideoId,
  getWorker,
  mediaCounts,
} from "@/data/mock";

export default function ReportClient() {
  const { id } = useParams<{ id: string }>();
  const session = getSession(id);
  const worker = session ? getWorker(session.workerId) : undefined;
  const primaryVideoId = session ? getSessionPrimaryVideoId(session) : null;
  const analysis = primaryVideoId ? getAnalysis(primaryVideoId) : undefined;
  const counts = session ? mediaCounts(session) : { videos: 0, products: 0 };

  if (!session) {
    return (
      <AppShell title="숙련도 평가서">
        <p className="text-sm text-muted">평가 세션을 찾을 수 없습니다.</p>
        <Link href="/evaluation/" className="mt-2 inline-block text-sm text-brand">
          평가 목록
        </Link>
      </AppShell>
    );
  }

  function downloadJson() {
    const payload = {
      session,
      primaryAnalysis: analysis ?? null,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${session!.regNo}-skill-report.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadCsv() {
    const lines = [
      "reg_no,session_id,worker_id,skill,exam_date,videos,photos,skill_score,skill_level,ncs_review,ai_confidence,manual_score",
      [
        session!.regNo,
        session!.id,
        session!.workerId,
        session!.skill,
        session!.examDate,
        counts.videos,
        counts.products,
        session!.skillScore ?? "",
        session!.skillLevel ?? "",
        session!.ncsReviewStatus ?? "",
        analysis?.confidence.aiConfidence ?? "",
        analysis?.manualScore ?? "",
      ].join(","),
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${session!.regNo}-skill-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell
      title="숙련도 평가서"
      subtitle={`${session.regNo} · ${worker?.name ?? session.workerId} · 세션 확정`}
      actions={
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/evaluation/${session.id}/`}
            className="rounded-lg border border-line px-3 py-2 text-sm"
          >
            NCS 평가
          </Link>
          {primaryVideoId ? (
            <Link
              href={`/analysis/${primaryVideoId}/`}
              className="rounded-lg border border-line px-3 py-2 text-sm"
            >
              대표 분석
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg border border-line px-3 py-2 text-sm"
          >
            인쇄
          </button>
          <button
            type="button"
            onClick={downloadJson}
            className="rounded-lg border border-line px-3 py-2 text-sm"
          >
            JSON
          </button>
          <button
            type="button"
            onClick={downloadCsv}
            className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white"
          >
            CSV
          </button>
        </div>
      }
    >
      {!analysis && session.status !== "completed" ? (
        <div className="rounded-xl border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">
          세션 분석 완료 후 평가서를 생성할 수 있습니다.{" "}
          <span className="ml-1">{session.status}</span>
        </div>
      ) : (
        <article className="report-sheet mx-auto max-w-3xl space-y-6 rounded-xl border border-line bg-surface p-8 shadow-sm print:border-0 print:shadow-none">
          <header className="border-b border-line pb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">
              UR Connection · 숙련도 평가서 (세션)
            </p>
            <h2 className="mt-2 text-2xl font-semibold">{worker?.name}</h2>
            <p className="mt-1 font-mono text-sm text-brand">{session.regNo}</p>
            <p className="mt-1 text-sm text-muted">
              {session.workerId} · {session.skill} · {session.examDate}
            </p>
            <p className="mt-1 text-xs text-muted">
              영상 {counts.videos} · 사진 {counts.products}
              {session.ncsReviewStatus
                ? ` · NCS ${session.ncsReviewStatus}`
                : ""}
            </p>
            <ul className="mt-2 space-y-0.5 text-[11px] text-muted">
              {session.media
                .filter((m) => m.kind === "video")
                .map((m) => (
                  <li key={m.id}>
                    {m.videoId} · {m.name}
                  </li>
                ))}
            </ul>
          </header>

          <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
            <div className="rounded-lg bg-brand-soft p-3">
              <p className="text-xs text-muted">세션 점수</p>
              <p className="text-3xl font-semibold text-brand">
                {session.skillScore ?? analysis?.skillScore ?? "—"}
              </p>
            </div>
            <div className="rounded-lg bg-bg p-3">
              <p className="text-xs text-muted">등급</p>
              <p className="text-2xl font-semibold">
                {session.skillLevel ?? analysis?.skillLevel ?? "—"}
              </p>
            </div>
            <div className="rounded-lg bg-bg p-3">
              <p className="text-xs text-muted">신뢰도</p>
              <p className="text-2xl font-semibold">
                {analysis ? `${analysis.confidence.aiConfidence}%` : "—"}
              </p>
            </div>
            <div className="rounded-lg bg-bg p-3">
              <p className="text-xs text-muted">평가자</p>
              <p className="text-2xl font-semibold">
                {analysis?.manualScore ?? "—"}
              </p>
            </div>
          </div>

          {analysis ? (
            <>
              <ExplainCard result={analysis} />
              <section>
                <h3 className="mb-2 text-sm font-semibold">세부 점수 · 가중치</h3>
                <ScoreBreakdown result={analysis} />
              </section>
              <section>
                <h3 className="mb-2 text-sm font-semibold">레이더</h3>
                <SkillRadar metrics={analysis.metrics} />
              </section>
              <section>
                <h3 className="mb-2 text-sm font-semibold">이상행동 · 감점</h3>
                <DeductionList
                  deductions={analysis.deductions}
                  frames={analysis.evidenceFrames}
                />
              </section>
              <ProductJudgmentPanel judgment={analysis.productJudgment} />
              <MatchingCard matching={analysis.matching} />
              <EvidenceGallery frames={analysis.evidenceFrames} highlightOnly />
            </>
          ) : (
            <p className="text-sm text-muted">
              대표 영상 분석 상세는 아직 없습니다. 세션 메타는 위와 같습니다.
              {!primaryVideoId ? null : (
                <StatusBadge status="queued" />
              )}
            </p>
          )}
        </article>
      )}
    </AppShell>
  );
}
