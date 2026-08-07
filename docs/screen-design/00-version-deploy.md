# 00 · 버전 분리 · 배포 전략

## 1. 버전 정의

| 버전 | 위치 | 성격 | 배포 |
|------|------|------|------|
| **v0.1** | 기존 `ur-connection` 레포 / `web` | 시연 흐름 중심 프로토타입 | [https://ur-prototype.github.io/dashboard/](https://ur-prototype.github.io/dashboard/) **동결** |
| **v0.2+** | **본 레포** `ur-connection-console` | 실사용 메뉴·업무 화면 | **새 GitHub repo + 새 배포 URL** |

v0.1 코드·URL은 발표·데모용으로 그대로 둡니다.  
기능·IA 개선은 본 레포에서만 진행합니다.

---

## 2. 레포 분리 원칙

| 원칙 | 내용 |
|------|------|
| 코드 독립 | v0.1 소스를 덮어쓰지 않음. 필요 시 참고·일부 컴포넌트만 이식 |
| URL 독립 | Pages path / 커스텀 도메인을 v0.1과 분리 (예: `…/console/` 또는 별도 org repo) |
| 문서 우선 | 구현 전 `docs/screen-design` 합의 → 셸 → 핵심 업무 화면 순 |
| 역할 분리 | 시연용 DemoFlow는 v0.1에만 유지. v0.2 사이드바에는 **업무 메뉴만** |

### 권장 원격 이름 (예시)

```text
GitHub: ur-prototype/ur-connection-console
배포 후보:
  A) https://ur-prototype.github.io/console/
  B) https://ur-prototype.github.io/ur-connection-console/
  C) 별도 도메인 / Vercel
```

배포 URL은 org·Pages 설정에 맞춰 확정하면 됩니다. **v0.1 `/dashboard/` 와 경로만 겹치지 않으면 됩니다.**

---

## 3. v0.1에서 가져올 것 / 버릴 것

### 가져올 것 (자산·패턴)

- 분석 결과 패턴: Explain, Pose overlay, Timeline, Score breakdown
- 평가서(`/reports`) 레이아웃 아이디어
- 목데이터 스키마 감각 (worker / job / analysis)
- 라이트 SaaS 톤 (다크·퍼플 글로우 배제)

### 버리지 않고 “분리”할 것

| v0.1 | v0.2 처리 |
|------|-----------|
| 사이드바 **시연 흐름 1~5** | 제거. 필요 시 **데모 모드** 토글 또는 `/demo` 별도 라우트 |
| 상단 `DemoFlowNav` (현황/작업자/…) | 업무 컨텍스트 브레드크럼으로 대체 |
| W-001 / V-101 하드코딩 메뉴 | 동적 ID · 목록→상세 drill-down만 |
| 시연 CTA 「시연 시작」 | 「작업자 등록」「영상 업로드」「검토 대기」등 업무 CTA |

---

## 4. 개발 단계와 배포

```text
Phase 0  기획 문서 합의          ← 현재
Phase 1  앱 셸 + 메뉴 + 빈 화면
Phase 2  핵심 업무 화면 (목록·상세·분석·검토)
Phase 3  GitHub Pages(또는 호스팅) 초회 배포 = v0.2.0
Phase 4  권한·승인·매칭·운영 고도화
```

v0.1 배포 파이프라인은 건드리지 않습니다.  
본 레포에 `.github/workflows` 를 **새로** 둡니다.

---

## 5. 한 줄 결론

**시연본(v0.1)은 URL째 동결, 실사용 콘솔은 새 레포·새 배포로 진행한다.**
