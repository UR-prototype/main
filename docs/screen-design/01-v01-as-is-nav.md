# 01 · v0.1 As-is 메뉴 · 클릭 맵

> 기준 배포: [https://ur-prototype.github.io/dashboard/](https://ur-prototype.github.io/dashboard/)  
> 소스 참고: 기존 `ur-connection/web` (`Sidebar.tsx`, `DemoFlowNav.tsx`, 각 page)  
> 목적: **지금 어디를 누르면 어디로 가는지**를 고정해 두고, v0.2에서 무엇을 바꿀지 근거로 씀

---

## 1. 사이드바 구조 (As-is)

### 그룹 A — 시연 흐름

| 메뉴 | 이동 URL | 비고 |
|------|----------|------|
| 1. 현황 | `/` | 홈 · 시연 안내 + KPI + 최근 분석 |
| 2. 작업자 | `/workers/W-001` | **DO TIEN DUC 고정** |
| 3. AI 분석 | `/analysis/V-101` | **V-101 고정** (pose 제외 하위 탭 포함 active) |
| 4. Pose | `/analysis/V-101/pose` | Pose만 별도 메뉴 |
| 5. 평가서 | `/reports/V-101` | PDF/인쇄형 평가서 |

### 그룹 B — 운영

| 메뉴 | 이동 URL |
|------|----------|
| 운영 현황 | `/ops` |
| 작업 영상 | `/jobs` |
| 분석 상태 | `/analysis/status` |
| 기술자 목록 | `/workers` |
| 실패 건 | `/ops/failures` |
| 직종별 분석 | `/job-types` |
| 인력 비교 | `/compare` |
| 업무 프로세스 | `/journey` |

### 하단

| 메뉴 | 이동 URL |
|------|----------|
| 로그아웃 | `/login` |

---

## 2. 화면 내 클릭 → 목적지

### `/` 현황(홈)

| 클릭 | 이동 |
|------|------|
| 시연 시작 | `/workers/W-001` |
| AI 분석 | `/analysis/V-101` |
| 운영 현황 · 상세 | `/ops` |
| 최근 분석 · 전체 | `/jobs` |
| 최근 분석 행 · 결과 (completed) | `/analysis/{videoId}` |
| 최근 분석 행 · 상태 (그 외) | `/analysis/status` |
| DemoFlowNav · 다음 · 작업자 | `/workers/W-001` |
| DemoFlowNav 각 스텝 | 해당 시연 URL |

### `/workers/{id}` 작업자 상세

| 클릭 | 이동 |
|------|------|
| 이 작업자 AI 분석 보기 | `/analysis/{latestCompleted.videoId}` |
| 분석 이력 행 · 결과 | `/analysis/{videoId}` (완료 시) |
| DemoFlowNav · 다음 · AI 분석 | `/analysis/{videoId}` |

### `/analysis/{videoId}` 및 하위

| 클릭 / 탭 | 이동 |
|-----------|------|
| 분석 탭 (종합·시간·반복·결과물·평가 등) | `/analysis/{id}`, `/time`, `/repetition`, `/product`, `/skill` … |
| Pose | `/analysis/{id}/pose` |
| 평가서 링크(있는 경우) | `/reports/{id}` |
| DemoFlowNav · 다음 · Pose / 평가서 | pose → report |

### `/reports/{id}`

| 클릭 | 이동 |
|------|------|
| DemoFlowNav · 시연 완료 · 현황으로 | `/` |

### 운영 계열 (요약)

| 화면 | 주요 이동 |
|------|-----------|
| `/ops` | 최근 잡 → 분석/상태, 실패 관련 → `/ops/failures` |
| `/jobs` | 행 → `/analysis/{videoId}` 또는 상태 |
| `/workers` | 행 → `/workers/{id}`, 등록 → `/workers/new` |
| `/ops/failures` | 재실행·배정 UI (프로토타입) |
| `/compare`, `/job-types`, `/journey` | 독립 조회·가이드 |

---

## 3. 시연 Happy Path (v0.1 의도)

```text
/  →  /workers/W-001  →  /analysis/V-101  →  /analysis/V-101/pose  →  /reports/V-101  →  /
```

사이드바 번호 메뉴와 상단 `DemoFlowNav`가 **같은 5단을 중복** 제공합니다.

---

## 4. As-is 문제 (v0.2에서 고칠 점)

1. **시연 메뉴가 글로벌 IA처럼 보임** — 실사용에서 1~5는 존재하지 않음  
2. **샘플 ID 하드코딩** — W-001 / V-101이 메뉴에 박힘  
3. **Pose가 탑레벨** — Pose는 분석 상세의 하위 뷰여야 함  
4. **운영 메뉴 과다·평탄** — 등록 / 검토 / 운영 구분이 약함  
5. **역할(company·evaluator·admin) 메뉴 차이 없음**  
6. **홈이 ‘시연 안내’** — 실사용 홈은 대기 업무·KPI·최근 건이어야 함  

→ 상세 개선안: [02-ia-menu.md](./02-ia-menu.md), [04-roadmap.md](./04-roadmap.md)
