# 기획 문서 → 프로토타입 정합 (v0.2 main)

기준 폴더: 유알커넥션 기획 (`원천데이터` · `데이터 정의서` · `AI PROTOCOL` · `WEB STRUCTURE` 브리핑)

## 반영한 핵심

| 기획 | 프로토타입 |
|------|------------|
| Stage = PREP/FIXED/MOVING/CONFIRM/CLOSE | `src/data/ncs.ts` + 라벨링·분석 |
| Event = IDLE/WRONG_SEQUENCE/TOOL_SWITCH… | 동일 + V-101 mock |
| NCS E1–E4·SAFE 루브릭 | `/evaluation/[id]` |
| 라벨→Feature→규칙→화면 근거 체인 | `EvidenceChain` on `/analysis/[id]` |
| Skills Verification · 시나리오 ID | `/register` · job.videoKind/scenarioId |
| Event ≠ 자동 NCS 미달 | 평가 화면 안내 문구 |

## 라이브

- https://ur-prototype.github.io/main/
- 라벨링 https://ur-prototype.github.io/main/labeling/
- 분석 V-101 https://ur-prototype.github.io/main/analysis/V-101/
- NCS 평가 https://ur-prototype.github.io/main/evaluation/V-101/
