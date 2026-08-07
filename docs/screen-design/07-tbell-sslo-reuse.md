# Tbell SSLO (영상 자동 라벨링) → UR Connection 활용

참고 레포: [tbell-dev](https://github.com/orgs/tbell-dev/repositories)

| 레포 | 역할 | UR에 쓸 것 |
|------|------|------------|
| [solution-frontend](https://github.com/tbell-dev/solution-frontend) | Vue 라벨링 콘솔 | 3단 스튜디오 · 상태 워크플로 · FPS 추출 UI |
| [solution-frontend-study](https://github.com/tbell-dev/solution-frontend-study) | Fabric 라벨링 캔버스 | (후순위) 키포인트 오버레이 고도화 |
| [solution-ai-model](https://github.com/tbell-dev/solution-ai-model) | Detectron2 + Triton · COCO | 근거 스키마 · confidence · bbox/keypoint |
| [solution-backend](https://github.com/tbell-dev/solution-backend) | JWT 인증만 | 나중에 로그인 패턴만 참고 |

## 핵심 판단

- **실 `<video>` 타임라인 플레이어는 SSLO에 거의 없음** → UR은 기존 Pose/Timeline 유지.
- 바로 쓸 패턴: **작업 상태(미작업→완료/반려)**, **스튜디오 메타바(단계·상태·담당)**, **프레임 스트립**, **업로드 시 FPS**, **COCO식 근거(category/score/bbox)**.

## UR 반영

1. 분석 화면 `StudioMetaBar` — 단계 · 파이프라인 상태 · 검토 · 담당
2. `FrameRail` — 근거 프레임 가로 스트립 (클리닝 스튜디오 FPS 추출 UI 감성)
3. 업로드 팝업 — 분석 샘플링 FPS
4. 근거 타입에 `category` / `score` 필드 정렬 (COCO 호환 메모)

로컬 클론: `c:\devlop\prototype\_ref-tbell\`
