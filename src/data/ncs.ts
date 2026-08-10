/** NCS · 데이터 정의서 정합 스키마 (금형조립 MVP) */

export const NCS_MOLD_ASSY = {
  code: "1510010411_18v3",
  title: "단순 사출금형 조립",
} as const;

export const NCS_SAFETY = {
  code: "1510010410_18v3",
  title: "안전규정준수",
} as const;

export const SCENARIO_MOLD = {
  id: "SC_MOLD_ASSY_L2_01",
  title: "시나리오 A · 기본 금형조립",
} as const;

export type NcsStageId =
  | "STAGE_PREP"
  | "STAGE_FIXED_ASSY"
  | "STAGE_MOVING_ASSY"
  | "STAGE_CONFIRM"
  | "STAGE_CLOSE";

export type NcsEventType =
  | "EVENT_IDLE"
  | "EVENT_WRONG_SEQUENCE"
  | "EVENT_TOOL_SWITCH"
  | "EVENT_EXCESSIVE_REACH"
  | "EVENT_REGRASP"
  | "EVENT_DROP"
  | "SAFETY_PPE"
  | "SAFETY_HAZARD"
  | "POSE_TRACK_FAIL";

export type NcsElementId = "E1" | "E2" | "E3" | "E4" | "SAFE";

export const NCS_STAGES: {
  id: NcsStageId;
  name: string;
  element: NcsElementId;
  elementLabel: string;
  color: string;
  hint: string;
}[] = [
  {
    id: "STAGE_PREP",
    name: "부품·공구 준비",
    element: "E1",
    elementLabel: "금형부품 준비하기",
    color: "#3b82f6",
    hint: "가져오기·배치·정리",
  },
  {
    id: "STAGE_FIXED_ASSY",
    name: "고정측 조립",
    element: "E2",
    elementLabel: "고정측 조립하기",
    color: "#10b981",
    hint: "고정측 정렬·체결",
  },
  {
    id: "STAGE_MOVING_ASSY",
    name: "가동측 조립",
    element: "E3",
    elementLabel: "가동측 조립하기",
    color: "#8b5cf6",
    hint: "가동측 정렬·체결",
  },
  {
    id: "STAGE_CONFIRM",
    name: "금형 확인",
    element: "E4",
    elementLabel: "금형 확인하기",
    color: "#0d9488",
    hint: "누락·체결·맞춤 확인",
  },
  {
    id: "STAGE_CLOSE",
    name: "정리·마무리",
    element: "SAFE",
    elementLabel: "안전·정리",
    color: "#64748b",
    hint: "공구 원위치·청소",
  },
];

export const NCS_EVENTS: {
  type: NcsEventType;
  name: string;
  role: string;
  metric?: "speed" | "stability" | "repetition" | "accuracy";
}[] = [
  {
    type: "EVENT_IDLE",
    name: "장시간 정지(Idle)",
    role: "속도 Feature · NCS 미달로 단정하지 않음",
    metric: "speed",
  },
  {
    type: "EVENT_WRONG_SEQUENCE",
    name: "작업순서 오류",
    role: "정확도 · E2/E3 미달 후보",
    metric: "accuracy",
  },
  {
    type: "EVENT_TOOL_SWITCH",
    name: "공구 변경",
    role: "동선 참고 / wrong 시 정확도",
    metric: "accuracy",
  },
  {
    type: "EVENT_EXCESSIVE_REACH",
    name: "과도한 손 뻗침",
    role: "안정성·동선 Feature",
    metric: "stability",
  },
  {
    type: "EVENT_REGRASP",
    name: "재파지",
    role: "unnecessary 시 E2/E3 참고",
    metric: "stability",
  },
  {
    type: "EVENT_DROP",
    name: "부품 낙하",
    role: "정확도·안전 후보",
    metric: "accuracy",
  },
  {
    type: "SAFETY_PPE",
    name: "보호구 미흡",
    role: "안전 능력단위 직접 증거",
  },
  {
    type: "SAFETY_HAZARD",
    name: "위험행동",
    role: "안전 능력단위 직접 증거",
  },
  {
    type: "POSE_TRACK_FAIL",
    name: "Pose 추적 실패",
    role: "해당 구간 Feature 제외·재추출",
  },
];

export const NCS_RUBRIC_ITEMS: {
  id: NcsElementId;
  code: string;
  title: string;
  stageHint: string;
  desc: string;
}[] = [
  {
    id: "E1",
    code: "E1",
    title: "금형부품 준비하기",
    stageHint: "STAGE_PREP",
    desc: "부품·공구 준비 완성도, 준비 중 Drop 등",
  },
  {
    id: "E2",
    code: "E2",
    title: "고정측 조립하기",
    stageHint: "STAGE_FIXED_ASSY",
    desc: "순서·체결·비효율 재파지·Drop",
  },
  {
    id: "E3",
    code: "E3",
    title: "가동측 조립하기",
    stageHint: "STAGE_MOVING_ASSY",
    desc: "가동측 정렬·체결·순서 준수",
  },
  {
    id: "E4",
    code: "E4",
    title: "금형 확인하기",
    stageHint: "STAGE_CONFIRM + 결과물",
    desc: "확인 행동 여부, PRODUCT/DEFECT",
  },
  {
    id: "SAFE",
    code: "SAFE",
    title: "안전규정준수",
    stageHint: "SAFETY_* · CLOSE",
    desc: "보호구·위험구역·공구 오남용",
  },
];

export type NcsStageSeg = {
  id: string;
  stageId: NcsStageId;
  start: number;
  end: number;
  note?: string;
};

export type NcsEventSeg = {
  id: string;
  type: NcsEventType;
  start: number;
  end: number;
  stageId?: NcsStageId;
  polarity?: "neutral" | "negative_candidate";
  note: string;
  ncsHint?: NcsElementId;
};

export type NcsRubricScore = {
  element: NcsElementId;
  score: number;
  evidence?: string;
};

export function stageMeta(id: NcsStageId) {
  return NCS_STAGES.find((s) => s.id === id)!;
}

export function eventMeta(type: NcsEventType) {
  return NCS_EVENTS.find((e) => e.type === type)!;
}
