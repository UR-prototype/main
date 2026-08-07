import poseSamplesV101 from "./_poseSamples_V-101.json";
import poseSamplesV201 from "./_poseSamples_V-201.json";

export type PipelineStatus =
  | "uploaded"
  | "queued"
  | "preprocessing"
  | "pose_extraction"
  | "analyzing"
  | "scoring"
  | "completed"
  | "failed";

/** @deprecated alias — use PipelineStatus */
export type AnalysisStatus = PipelineStatus;

export type SkillLevel = "초급" | "중급" | "고급";
export type JobType = "금형조립" | "기계가공" | "사출" | "프레스" | "용접";
export type UserRole = "admin" | "evaluator" | "company";
export type ReviewStatus = "미검토" | "검토중" | "승인" | "반려";

export const SCORE_WEIGHTS = {
  speed: 0.3,
  stability: 0.25,
  repetition: 0.2,
  accuracy: 0.25,
} as const;

export const PIPELINE_STEPS: PipelineStatus[] = [
  "uploaded",
  "queued",
  "preprocessing",
  "pose_extraction",
  "analyzing",
  "scoring",
  "completed",
];

export type MatchingRecommendation = {
  eligible: boolean;
  recommendedJob: string;
  recommendedSites: string[];
  reason: string;
};

export type Worker = {
  id: string;
  name: string;
  nationality: string;
  age: number;
  skill: JobType;
  agency: string;
  company: string;
  registeredAt: string;
  latestScore: number | null;
  latestLevel: SkillLevel | null;
  analysisStatus: PipelineStatus;
  highRisk?: boolean;
  scoreHistory: { month: string; score: number }[];
};

export type WorkJob = {
  id: string;
  workerId: string;
  videoId: string;
  jobType: JobType;
  workDate: string;
  videoName: string;
  durationSec: number;
  fps: number;
  status: PipelineStatus;
  progress: number;
  skillScore?: number | null;
  assignee?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
};

export type PoseSample = {
  t: number;
  joints: { name: string; x: number; y: number; conf: number }[];
};

export type TimeSegment = {
  start: number;
  end: number;
  type: "work" | "idle" | "anomaly";
  label: string;
};

export type Deduction = {
  key: string;
  label: string;
  metric: keyof typeof SCORE_WEIGHTS;
  impact: number;
  t: number;
  detail: string;
};

export type EvidenceFrame = {
  t: number;
  src: string;
  title: string;
  finding: string;
  tag: "work" | "idle" | "anomaly" | "key";
  metric?: keyof typeof SCORE_WEIGHTS;
  impact?: number;
};

export type ProductCheckItem = {
  id: string;
  src: string;
  title: string;
  verdict: "pass" | "warn" | "fail";
  criteria: string;
  finding: string;
  scoreImpact: number;
};

export type ProductJudgment = {
  overall: "합격" | "조건부합격" | "불합격";
  score: number;
  referenceSrc: string;
  candidateSrc: string;
  checklist: ProductCheckItem[];
  summary: string;
};

export type AnalysisResult = {
  videoId: string;
  workerId: string;
  jobType: JobType;
  skillScore: number;
  skillLevel: SkillLevel;
  weights: typeof SCORE_WEIGHTS;
  metrics: {
    speed: number;
    repetition: number;
    stability: number;
    accuracy: number;
    workSeconds: number;
    idleSeconds: number;
    repeatCount: number;
  };
  contributions: {
    speed: number;
    stability: number;
    repetition: number;
    accuracy: number;
  };
  features: {
    hand_travel: number;
    joint_angle_var: number;
    work_speed: number;
    motion_energy: number;
    idle_time: number;
    cycle_count: number;
    tool_switch_count: number;
  };
  confidence: {
    aiConfidence: number;
    poseTrackingQuality: number;
    detectionCoverage: number;
  };
  deductions: Deduction[];
  evidenceFrames: EvidenceFrame[];
  productJudgment: ProductJudgment;
  anomalies: { t: number; type: string; label: string }[];
  summary: string;
  improvements: string[];
  matching: MatchingRecommendation;
  manualScore: number;
  manualComment: string;
  reviewStatus: ReviewStatus;
  poseSamples: PoseSample[];
  timeSegments: TimeSegment[];
  framesExtracted: number;
  posePoints: number;
  processedAt: string;
};

export const assignees = [
  "평가자 A",
  "운영 담당",
  "평가자 B",
];

export function computeScore(m: {
  speed: number;
  stability: number;
  repetition: number;
  accuracy: number;
}) {
  const contributions = {
    speed: +(m.speed * SCORE_WEIGHTS.speed).toFixed(2),
    stability: +(m.stability * SCORE_WEIGHTS.stability).toFixed(2),
    repetition: +(m.repetition * SCORE_WEIGHTS.repetition).toFixed(2),
    accuracy: +(m.accuracy * SCORE_WEIGHTS.accuracy).toFixed(2),
  };
  const skillScore = Math.round(
    contributions.speed +
      contributions.stability +
      contributions.repetition +
      contributions.accuracy,
  );
  const skillLevel: SkillLevel =
    skillScore >= 85 ? "고급" : skillScore >= 65 ? "중급" : "초급";
  return { skillScore, skillLevel, contributions };
}

export const workers: Worker[] = [
  {
    id: "W-001",
    name: "DO TIEN DUC",
    nationality: "Vietnam",
    age: 28,
    skill: "금형조립",
    agency: "URCONNECTION",
    company: "서용건설(주)",
    registeredAt: "2026-03-12",
    latestScore: 78,
    latestLevel: "중급",
    analysisStatus: "completed",
    scoreHistory: [
      { month: "2026-04", score: 72 },
      { month: "2026-05", score: 75 },
      { month: "2026-06", score: 78 },
    ],
  },
  {
    id: "W-002",
    name: "AKMAL KARIMOV",
    nationality: "Uzbekistan",
    age: 31,
    skill: "기계가공",
    agency: "1차 건설 우즈벡",
    company: "미배정",
    registeredAt: "2026-04-02",
    latestScore: 86,
    latestLevel: "고급",
    analysisStatus: "completed",
    scoreHistory: [
      { month: "2026-04", score: 80 },
      { month: "2026-05", score: 83 },
      { month: "2026-06", score: 86 },
    ],
  },
  {
    id: "W-003",
    name: "NGUYEN VAN HUNG",
    nationality: "Vietnam",
    age: 25,
    skill: "용접",
    agency: "URCONNECTION",
    company: "한빛금속",
    registeredAt: "2026-04-18",
    latestScore: 64,
    latestLevel: "초급",
    analysisStatus: "analyzing",
    highRisk: true,
    scoreHistory: [
      { month: "2026-05", score: 61 },
      { month: "2026-06", score: 64 },
    ],
  },
  {
    id: "W-004",
    name: "BISHAL THAPA",
    nationality: "Nepal",
    age: 29,
    skill: "프레스",
    agency: "JV Best Global",
    company: "미배정",
    registeredAt: "2026-05-01",
    latestScore: null,
    latestLevel: null,
    analysisStatus: "queued",
    scoreHistory: [],
  },
  {
    id: "W-005",
    name: "SOMCHAI PRASERT",
    nationality: "Thailand",
    age: 34,
    skill: "사출",
    agency: "URCONNECTION",
    company: "동아라텍",
    registeredAt: "2026-05-09",
    latestScore: 58,
    latestLevel: "초급",
    analysisStatus: "failed",
    highRisk: true,
    scoreHistory: [
      { month: "2026-04", score: 62 },
      { month: "2026-05", score: 58 },
    ],
  },
];

export const jobs: WorkJob[] = [
  {
    id: "J-101",
    workerId: "W-001",
    videoId: "V-101",
    jobType: "금형조립",
    workDate: "2026-06-10",
    videoName: "skills_verification_duc_01.mp4",
    durationSec: 2668,
    fps: 30,
    status: "completed",
    progress: 100,
    skillScore: 78,
    assignee: "평가자 A",
  },
  {
    id: "J-102",
    workerId: "W-001",
    videoId: "V-102",
    jobType: "금형조립",
    workDate: "2026-05-11",
    videoName: "experience_duc_02.mp4",
    durationSec: 3389,
    fps: 30,
    status: "completed",
    progress: 100,
    skillScore: 75,
    assignee: "평가자 A",
  },
  {
    id: "J-103",
    workerId: "W-001",
    videoId: "V-103",
    jobType: "금형조립",
    workDate: "2026-04-22",
    videoName: "skills_verification_duc_00.mp4",
    durationSec: 2100,
    fps: 30,
    status: "completed",
    progress: 100,
    skillScore: 72,
    assignee: "평가자 B",
  },
  {
    id: "J-201",
    workerId: "W-002",
    videoId: "V-201",
    jobType: "기계가공",
    workDate: "2026-06-12",
    videoName: "machining_akmal_01.mp4",
    durationSec: 1840,
    fps: 25,
    status: "completed",
    progress: 100,
    skillScore: 86,
    assignee: "평가자 B",
  },
  {
    id: "J-301",
    workerId: "W-003",
    videoId: "V-301",
    jobType: "용접",
    workDate: "2026-06-14",
    videoName: "welding_hung_01.mp4",
    durationSec: 920,
    fps: 30,
    status: "pose_extraction",
    progress: 45,
    skillScore: null,
    assignee: "운영 담당",
  },
  {
    id: "J-401",
    workerId: "W-004",
    videoId: "V-401",
    jobType: "프레스",
    workDate: "2026-06-15",
    videoName: "press_bishal_01.mp4",
    durationSec: 640,
    fps: 30,
    status: "queued",
    progress: 5,
    skillScore: null,
    assignee: null,
  },
  {
    id: "J-501",
    workerId: "W-005",
    videoId: "V-501",
    jobType: "사출",
    workDate: "2026-05-08",
    videoName: "injection_somchai_01.mp4",
    durationSec: 1510,
    fps: 30,
    status: "failed",
    progress: 30,
    skillScore: null,
    assignee: null,
    errorCode: "POSE_LOW_COVERAGE",
    errorMessage: "유효 포즈 프레임 비율 42% — 재촬영 또는 재실행 필요",
  },
];

const m101 = { speed: 72, stability: 75, repetition: 81, accuracy: 80 };
const s101 = computeScore(m101);

const m201 = { speed: 84, stability: 90, repetition: 88, accuracy: 85 };
const s201 = computeScore(m201);

export const analyses: Record<string, AnalysisResult> = {
  "V-101": {
    videoId: "V-101",
    workerId: "W-001",
    jobType: "금형조립",
    skillScore: s101.skillScore,
    skillLevel: s101.skillLevel,
    weights: SCORE_WEIGHTS,
    metrics: {
      ...m101,
      workSeconds: 320,
      idleSeconds: 45,
      repeatCount: 12,
    },
    contributions: s101.contributions,
    features: {
      hand_travel: 142.6,
      joint_angle_var: 0.18,
      work_speed: 0.72,
      motion_energy: 88.4,
      idle_time: 45,
      cycle_count: 12,
      tool_switch_count: 5,
    },
    confidence: {
      aiConfidence: 94,
      poseTrackingQuality: 96,
      detectionCoverage: 91,
    },
    deductions: [
      {
        key: "idle_long",
        label: "Idle Time 45초",
        metric: "speed",
        impact: -8,
        t: 42.5,
        detail: "저움직임 연속 구간이 30초 이상으로 속도 점수 감점",
      },
      {
        key: "hand_travel_high",
        label: "손 이동량 과다",
        metric: "stability",
        impact: -5,
        t: 118,
        detail: "양손목 누적 이동량이 기준치 초과",
      },
      {
        key: "repeat_unstable",
        label: "반복 패턴 불안정",
        metric: "repetition",
        impact: -4,
        t: 95,
        detail: "사이클 주기 변동계수가 큼",
      },
      {
        key: "tool_switch",
        label: "Tool Switching 빈번",
        metric: "accuracy",
        impact: -3,
        t: 110,
        detail: "급격한 자세 전환 5회 감지",
      },
      {
        key: "product_align",
        label: "결과물 정렬 편차",
        metric: "accuracy",
        impact: -4,
        t: 720,
        detail: "완성품 사진 기준 맞춤면 간격이 허용치 초과",
      },
    ],
    evidenceFrames: [
      {
        t: 5,
        src: "/evidence/V-101/frame-01-0005s.jpg",
        title: "작업 시작 · 자세 정렬",
        finding: "양손 위치 안정, 작업 준비 동작으로 인식",
        tag: "key",
      },
      {
        t: 12,
        src: "/evidence/V-101/frame-02-0012s.jpg",
        title: "부품 정렬",
        finding: "손목·팔꿈치 각도 정상 범위, 정확도 가산 구간",
        tag: "work",
        metric: "accuracy",
      },
      {
        t: 25,
        src: "/evidence/V-101/frame-03-0025s.jpg",
        title: "조립 동작 진행",
        finding: "연속 작업 구간 · 속도 지표 산출 기준점",
        tag: "work",
        metric: "speed",
      },
      {
        t: 42,
        src: "/evidence/V-101/frame-04-0042s.jpg",
        title: "장시간 정지 감지",
        finding: "저움직임 지속 → Idle Time 감점 (−8)",
        tag: "idle",
        metric: "speed",
        impact: -8,
      },
      {
        t: 55,
        src: "/evidence/V-101/frame-05-0055s.jpg",
        title: "작업 재개",
        finding: "정지 이후 조립 재개 · 가동률 회복 구간",
        tag: "work",
      },
      {
        t: 70,
        src: "/evidence/V-101/frame-06-0070s.jpg",
        title: "반복 사이클 #1",
        finding: "동일 동작 패턴 검출 · 반복성 산출",
        tag: "work",
        metric: "repetition",
      },
      {
        t: 85,
        src: "/evidence/V-101/frame-07-0085s.jpg",
        title: "반복 사이클 #2",
        finding: "주기 간격이 이전 사이클과 편차 발생",
        tag: "work",
        metric: "repetition",
      },
      {
        t: 95,
        src: "/evidence/V-101/frame-08-0095s.jpg",
        title: "반복 패턴 불안정",
        finding: "사이클 변동계수 상승 → 반복성 감점 (−4)",
        tag: "anomaly",
        metric: "repetition",
        impact: -4,
      },
      {
        t: 110,
        src: "/evidence/V-101/frame-09-0110s.jpg",
        title: "공구 교체 동작",
        finding: "급격한 자세 전환 · Tool Switching (−3)",
        tag: "anomaly",
        metric: "accuracy",
        impact: -3,
      },
      {
        t: 118,
        src: "/evidence/V-101/frame-10-0118s.jpg",
        title: "손 이동량 과다",
        finding: "양손목 궤적 과다 → 안정성 감점 (−5)",
        tag: "anomaly",
        metric: "stability",
        impact: -5,
      },
      {
        t: 135,
        src: "/evidence/V-101/frame-11-0135s.jpg",
        title: "정렬 재확인",
        finding: "부품 위치 보정 동작 · 정확도 보완 구간",
        tag: "work",
        metric: "accuracy",
      },
      {
        t: 150,
        src: "/evidence/V-101/frame-12-0150s.jpg",
        title: "연속 조립",
        finding: "안정적 작업 구간 · 중급 숙련 패턴",
        tag: "work",
      },
      {
        t: 180,
        src: "/evidence/V-101/frame-13-0180s.jpg",
        title: "마무리 점검",
        finding: "작업 완료 전 확인 동작으로 분류",
        tag: "key",
      },
      {
        t: 220,
        src: "/evidence/V-101/frame-14-0220s.jpg",
        title: "후반 작업 구간",
        finding: "움직임 밀도 유지 · 속도 지표 반영",
        tag: "work",
        metric: "speed",
      },
      {
        t: 280,
        src: "/evidence/V-101/frame-15-0280s.jpg",
        title: "후반 반복 동작",
        finding: "반복 사이클 추가 검출",
        tag: "work",
        metric: "repetition",
      },
      {
        t: 340,
        src: "/evidence/V-101/frame-16-0340s.jpg",
        title: "자세 안정 구간",
        finding: "관절 각도 분산 낮음 · 안정성 양호",
        tag: "work",
        metric: "stability",
      },
      {
        t: 420,
        src: "/evidence/V-101/frame-17-0420s.jpg",
        title: "작업 지속",
        finding: "정상 작업 패턴 유지",
        tag: "work",
      },
      {
        t: 500,
        src: "/evidence/V-101/frame-18-0500s.jpg",
        title: "중후반 조립",
        finding: "손 위치·공구 파지 상태 추적",
        tag: "key",
      },
      {
        t: 600,
        src: "/evidence/V-101/frame-19-0600s.jpg",
        title: "후반부 점검",
        finding: "품질 확인 동작으로 인식",
        tag: "key",
      },
      {
        t: 720,
        src: "/evidence/V-101/frame-20-0720s.jpg",
        title: "작업 종료 전",
        finding: "분석 구간 말미 · 종합 점수 산출 반영",
        tag: "key",
      },
    ],
    productJudgment: {
      overall: "조건부합격",
      score: 80,
      referenceSrc: "/evidence/products/product-reference.png",
      candidateSrc: "/evidence/products/product-candidate.png",
      summary:
        "완성품 외관·체결은 양호하나 맞춤면 정렬과 표면 버가 기준에 미달하여 정확도 점수에 반영되었습니다.",
      checklist: [
        {
          id: "pj-pass-1",
          src: "/evidence/products/product-pass-01.png",
          title: "가공면 · 치수 외관",
          verdict: "pass",
          criteria: "표면 조도 · 원통부 외관 정상",
          finding: "기준 샘플 대비 외관 일치 · 합격",
          scoreImpact: 0,
        },
        {
          id: "pj-pass-2",
          src: "/evidence/products/product-pass-02.png",
          title: "체결 · 조립 상태",
          verdict: "pass",
          criteria: "볼트 체결 균일 · 유격 없음",
          finding: "체결 토크 흔적 균일 · 합격",
          scoreImpact: 0,
        },
        {
          id: "pj-fail-align",
          src: "/evidence/products/product-fail-align.png",
          title: "맞춤면 정렬",
          verdict: "fail",
          criteria: "맞춤 간격 ≤ 0.3mm",
          finding: "맞춤면 간격 과다 · 정렬 편차 검출 (−4)",
          scoreImpact: -4,
        },
        {
          id: "pj-fail-surface",
          src: "/evidence/products/product-fail-surface.png",
          title: "표면 · 버(burr)",
          verdict: "warn",
          criteria: "모서리 버·스크래치 없음",
          finding: "모서리 버 잔존 · 재작업 권고 (−2)",
          scoreImpact: -2,
        },
      ],
    },
    anomalies: [
      { t: 42.5, type: "idle_long", label: "장시간 정지" },
      { t: 118.0, type: "unstable_grip", label: "공구 파지 불안정" },
    ],
    summary:
      "공구 파지와 반복 패턴은 중급 수준이나 Idle·이동량·공구교체와 결과물 정렬 편차로 속도·안정성·정확도에서 감점.",
    improvements: [
      "중간 정지 구간을 20초 이내로 단축",
      "조립 사이클 템포를 일정하게 유지",
      "공구 교체 동선을 사전 배치로 최소화",
      "맞춤면 정렬·모서리 버 제거 후 재촬영",
    ],
    matching: {
      eligible: true,
      recommendedJob: "금형조립 (주작업 가능 · 교육 병행)",
      recommendedSites: ["자동차부품 A라인", "금형셀 B"],
      reason:
        "중급(78) · 반복성 양호 · Idle 보완 시 즉시 투입 가능 — 조건부 매칭",
    },
    manualScore: 82,
    manualComment: "현장 평가: 부품 정렬은 우수, 작업 템포만 보완 필요.",
    reviewStatus: "승인",
    poseSamples: poseSamplesV101 as PoseSample[],
    timeSegments: [
      { start: 0, end: 40, type: "work", label: "부품 정렬" },
      { start: 40, end: 55, type: "idle", label: "정지" },
      { start: 55, end: 110, type: "work", label: "조립 반복" },
      { start: 110, end: 125, type: "anomaly", label: "불안정 파지" },
      { start: 125, end: 180, type: "work", label: "마무리 점검" },
    ],
    framesExtracted: 8004,
    posePoints: 132088,
    processedAt: "2026-06-10T14:22:00+09:00",
  },
  "V-201": {
    videoId: "V-201",
    workerId: "W-002",
    jobType: "기계가공",
    skillScore: s201.skillScore,
    skillLevel: s201.skillLevel,
    weights: SCORE_WEIGHTS,
    metrics: {
      ...m201,
      workSeconds: 410,
      idleSeconds: 18,
      repeatCount: 20,
    },
    contributions: s201.contributions,
    features: {
      hand_travel: 98.2,
      joint_angle_var: 0.11,
      work_speed: 0.84,
      motion_energy: 70.1,
      idle_time: 18,
      cycle_count: 20,
      tool_switch_count: 2,
    },
    confidence: {
      aiConfidence: 97,
      poseTrackingQuality: 98,
      detectionCoverage: 95,
    },
    deductions: [
      {
        key: "tool_change_slow",
        label: "공구 교체 지연",
        metric: "speed",
        impact: -3,
        t: 210,
        detail: "교체 구간 25초 — 기준 15초 대비 지연",
      },
    ],
    evidenceFrames: [
      {
        t: 180,
        src: "/evidence/V-201/frame-13-0180s.jpg",
        title: "연속 가공",
        finding: "안정적 작업 자세 · 고급 숙련 패턴",
        tag: "work",
        metric: "stability",
      },
      {
        t: 220,
        src: "/evidence/V-201/frame-14-0220s.jpg",
        title: "공구 교체 구간",
        finding: "교체 지연 감지 → 속도 소폭 감점 (−3)",
        tag: "anomaly",
        metric: "speed",
        impact: -3,
      },
      {
        t: 280,
        src: "/evidence/V-201/frame-15-0280s.jpg",
        title: "가공 재개",
        finding: "교체 후 즉시 정상 작업 복귀",
        tag: "work",
      },
      {
        t: 340,
        src: "/evidence/V-201/frame-16-0340s.jpg",
        title: "고정밀 동작",
        finding: "손 궤적 안정 · 정확도 상위",
        tag: "work",
        metric: "accuracy",
      },
      {
        t: 420,
        src: "/evidence/V-201/frame-17-0420s.jpg",
        title: "반복 가공",
        finding: "사이클 규칙성 높음 · 반복성 우수",
        tag: "work",
        metric: "repetition",
      },
      {
        t: 500,
        src: "/evidence/V-201/frame-18-0500s.jpg",
        title: "후반 작업",
        finding: "속도·안정성 동시 유지",
        tag: "key",
      },
      {
        t: 600,
        src: "/evidence/V-201/frame-19-0600s.jpg",
        title: "점검 동작",
        finding: "품질 확인 후 작업 지속",
        tag: "key",
      },
      {
        t: 720,
        src: "/evidence/V-201/frame-20-0720s.jpg",
        title: "작업 마무리",
        finding: "종합 점수 고급 구간 확정",
        tag: "key",
      },
    ],
    productJudgment: {
      overall: "합격",
      score: 92,
      referenceSrc: "/evidence/products/product-reference.png",
      candidateSrc: "/evidence/products/product-pass-02.png",
      summary:
        "완성품이 기준 샘플과 정합합니다. 가공면·체결·표면 모두 합격으로 정확도 가산에 반영되었습니다.",
      checklist: [
        {
          id: "pj201-1",
          src: "/evidence/products/product-pass-01.png",
          title: "가공면 · 치수 외관",
          verdict: "pass",
          criteria: "표면 조도 · 원통부 외관 정상",
          finding: "기준 대비 일치 · 합격",
          scoreImpact: 0,
        },
        {
          id: "pj201-2",
          src: "/evidence/products/product-pass-02.png",
          title: "체결 · 조립 상태",
          verdict: "pass",
          criteria: "볼트 체결 균일 · 유격 없음",
          finding: "체결 상태 우수 · 합격",
          scoreImpact: 0,
        },
        {
          id: "pj201-3",
          src: "/evidence/products/product-candidate.png",
          title: "최종 조립 외관",
          verdict: "pass",
          criteria: "완성품 전체 외관 이상 없음",
          finding: "기준 샘플과 동등 · 합격",
          scoreImpact: 0,
        },
        {
          id: "pj201-4",
          src: "/evidence/products/product-reference.png",
          title: "기준 샘플 대조",
          verdict: "pass",
          criteria: "마스터 샘플 대비 형상 일치",
          finding: "형상·마감 일치 · 합격",
          scoreImpact: 0,
        },
      ],
    },
    anomalies: [{ t: 210.0, type: "tool_change_slow", label: "공구 교체 지연" }],
    summary: "가공 속도·반복성·안정성 상위. 공구 교체 구간만 소폭 감점.",
    improvements: ["공구 사전 준비로 교체 시간 단축"],
    matching: {
      eligible: true,
      recommendedJob: "기계가공 / CNC 보조 → 주작업",
      recommendedSites: ["정밀가공 라인 C", "수출부품 셀"],
      reason: "고급(86) · 안정성·반복성 상위 — 즉시 매칭 가능",
    },
    manualScore: 84,
    manualComment: "평가자 점수와 시스템 점수 편차가 작아 일치도가 높음.",
    reviewStatus: "검토중",
    poseSamples: poseSamplesV201 as PoseSample[],
    timeSegments: [
      { start: 0, end: 200, type: "work", label: "연속 가공" },
      { start: 200, end: 225, type: "anomaly", label: "공구 교체" },
      { start: 225, end: 300, type: "work", label: "재개" },
    ],
    framesExtracted: 4600,
    posePoints: 98000,
    processedAt: "2026-06-12T11:05:00+09:00",
  },
};

export const jobTypes = [
  {
    id: "금형조립",
    supported: true,
    note: "숙련도 지표 및 가중치 적용",
    features: ["hand_travel", "cycle_count", "idle_time", "tool_switch"],
  },
  {
    id: "기계가공",
    supported: "demo" as const,
    note: "시범 적용",
    features: ["work_speed", "stability"],
  },
  {
    id: "용접",
    supported: false,
    note: "용접 자세·아크 시간 지표 확장 예정",
    features: [],
  },
  {
    id: "CNC",
    supported: false,
    note: "가공 경로·사이클 지표 확장 예정",
    features: [],
  },
  {
    id: "검사/포장",
    supported: false,
    note: "검사 포인트 체류 지표 확장 예정",
    features: [],
  },
];

export function getWorker(id: string) {
  return workers.find((w) => w.id === id);
}

export function getJobsByWorker(workerId: string) {
  return jobs.filter((j) => j.workerId === workerId);
}

export function getJob(videoId: string) {
  return jobs.find((j) => j.videoId === videoId);
}

export function getAnalysis(videoId: string) {
  return analyses[videoId];
}

export const opsSummary = {
  todayCompleted: 15,
  avgScore: 76,
  highRiskWorkers: workers.filter((w) => w.highRisk).length,
  failedJobs: jobs.filter((j) => j.status === "failed").length,
  inPipeline: jobs.filter(
    (j) => !["completed", "failed"].includes(j.status),
  ).length,
  todayLabel: "2026-06-30 기준 (목)",
};

export const dashboardStats = {
  totalWorkers: workers.length,
  videosRegistered: jobs.length,
  analysisCompleted: jobs.filter((j) => j.status === "completed").length,
  avgScore: Math.round(
    workers
      .filter((w) => w.latestScore != null)
      .reduce((s, w) => s + (w.latestScore ?? 0), 0) /
      workers.filter((w) => w.latestScore != null).length,
  ),
  queued: jobs.filter((j) => j.status === "queued" || j.status === "uploaded")
    .length,
  processing: jobs.filter((j) =>
    ["preprocessing", "pose_extraction", "analyzing", "scoring"].includes(
      j.status,
    ),
  ).length,
  failed: jobs.filter((j) => j.status === "failed").length,
  levelDist: [
    { name: "초급", value: workers.filter((w) => w.latestLevel === "초급").length },
    { name: "중급", value: workers.filter((w) => w.latestLevel === "중급").length },
    { name: "고급", value: workers.filter((w) => w.latestLevel === "고급").length },
    { name: "미분석", value: workers.filter((w) => w.latestLevel == null).length },
  ],
  scoreTrend: [
    { name: "W-001", score: 78, manual: 82 },
    { name: "W-002", score: 86, manual: 84 },
    { name: "W-003", score: 64, manual: 66 },
  ],
};

export const currentUser = {
  name: "관리자",
  role: "admin" as UserRole,
};

export function getFailedJobs() {
  return jobs.filter((j) => j.status === "failed");
}

export const iaBreadcrumb = [
  { label: "Dashboard", href: "/" },
  { label: "Worker", href: "/workers" },
  { label: "Video/Jobs", href: "/jobs" },
  { label: "Analysis", href: "/analysis/V-101" },
  { label: "Report", href: "/reports/V-101" },
];
