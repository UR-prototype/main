# UR Connection Console

실사용 콘솔 **v0.2** — 별도 배포용 레포.

| | |
|--|--|
| **시연본 v0.1 (동결)** | https://ur-prototype.github.io/dashboard/ |
| **본 콘솔** | https://ur-prototype.github.io/main/ |
| **원격** | https://github.com/UR-prototype/main |

## 메뉴 IA

사이드바는 상위 3개만. 하위는 **본문 상단 탭**.

```text
대시보드
작업·분석  →  전체 영상 | 진행·검토 | 실패
기술자     →  목록 | 직종 | 비교
```

- **작업 영상 / 분석 상태 / 실패 건** → 같은 평가 건의 다른 보기라 **작업·분석**으로 병합
- **인력 비교** → 기술자 · **비교** 탭 (직종 선택 + 표)
- **직종별 분석** → 기술자 · **직종** 탭 (인력·관련 영상·비교 이동)
- **업무 프로세스** → 제거 (시연 가이드용이었음)

## 로컬

```bash
npm install
npm run dev
```

## 배포

`main` 브랜치 push 시 GitHub Actions가 `out/` 을 `gh-pages`로 배포합니다.  
Repo Settings → Pages → Source: **gh-pages** 브랜치.

상세 기획: `docs/screen-design/`
