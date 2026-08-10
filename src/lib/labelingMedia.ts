import {
  assessmentSessions,
  getWorker,
  type AssessmentSession,
  type SessionMedia,
  type SessionMediaKind,
} from "@/data/mock";

export type LabelingMediaItem = {
  key: string;
  sessionId: string;
  regNo: string;
  workerId: string;
  workerName: string;
  skill: string;
  examDate: string;
  media: SessionMedia;
  mediaKind: "video" | "image";
  kindLabel: string;
};

function kindLabel(kind: SessionMediaKind) {
  switch (kind) {
    case "video":
      return "영상";
    case "product_ref":
      return "기준 사진";
    case "product_candidate":
      return "결과 사진";
    case "product_other":
      return "추가 사진";
    default:
      return kind;
  }
}

export function buildLabelingCatalog(): LabelingMediaItem[] {
  const rows: LabelingMediaItem[] = [];
  for (const s of assessmentSessions) {
    const w = getWorker(s.workerId);
    for (const m of s.media) {
      rows.push({
        key: `${s.id}:${m.id}`,
        sessionId: s.id,
        regNo: s.regNo,
        workerId: s.workerId,
        workerName: w?.name ?? s.workerId,
        skill: s.skill,
        examDate: s.examDate,
        media: m,
        mediaKind: m.kind === "video" ? "video" : "image",
        kindLabel: kindLabel(m.kind),
      });
    }
  }
  return rows.sort((a, b) => {
    const d = b.examDate.localeCompare(a.examDate);
    if (d !== 0) return d;
    if (a.mediaKind !== b.mediaKind) return a.mediaKind === "video" ? -1 : 1;
    return a.media.name.localeCompare(b.media.name);
  });
}

export function filterCatalog(
  items: LabelingMediaItem[],
  opts: {
    workerId?: string;
    sessionId?: string;
    mediaKind?: "all" | "video" | "image";
    q?: string;
  },
) {
  return items.filter((it) => {
    if (opts.workerId && opts.workerId !== "all" && it.workerId !== opts.workerId)
      return false;
    if (
      opts.sessionId &&
      opts.sessionId !== "all" &&
      it.sessionId !== opts.sessionId
    )
      return false;
    if (opts.mediaKind && opts.mediaKind !== "all" && it.mediaKind !== opts.mediaKind)
      return false;
    if (opts.q) {
      const q = opts.q.toLowerCase();
      const hay = [
        it.regNo,
        it.workerName,
        it.skill,
        it.media.name,
        it.media.videoId ?? "",
        it.kindLabel,
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function sessionsForWorker(workerId: string): AssessmentSession[] {
  if (!workerId || workerId === "all") return assessmentSessions;
  return assessmentSessions.filter((s) => s.workerId === workerId);
}

export function timelineHref(item: LabelingMediaItem) {
  if (item.mediaKind !== "video" || !item.media.videoId) return null;
  return `/labeling/?session=${item.sessionId}&video=${item.media.videoId}`;
}

export function productHref(item: LabelingMediaItem) {
  if (item.mediaKind !== "image") return null;
  const params = new URLSearchParams({
    session: item.sessionId,
    media: item.media.id,
  });
  return `/labeling/product/?${params.toString()}`;
}
