# Rollbook 개선 로드맵

> 총 38개 개선 항목 | 예상 소요: ~15주

---

## P0 - 즉시 해결 필요 (Critical)

### 보안 (Security)
- [ ] **평문 비밀번호 저장 제거** - `src/lib/user-store.ts:91,114`
  - `passwordPlain` 필드가 JSON 파일에 평문 저장됨
  - 해결: bcrypt 해시만 사용, `passwordPlain` 필드 완전 삭제
  - 예상: Small

- [ ] **세션 시크릿 기본값 제거** - `src/lib/session.ts:4`
  - `SESSION_SECRET`이 미설정 시 `"dev-session-secret"` 사용됨
  - 해결: 프로덕션에서 환경변수 미설정 시 서버 시작 실패하도록 변경
  - 예상: Small

- [ ] **CSRF 보호 추가**
  - 모든 POST/PUT/DELETE 라우트에 CSRF 토큰 없음
  - 해결: CSRF 토큰 검증 미들웨어 추가
  - 예상: Medium

- [ ] **로그인 레이트 리미팅** - `src/app/api/session/route.ts`
  - 로그인 시도 횟수 제한 없음 (브루트포스 공격 가능)
  - 해결: IP당 분당 5회 시도 제한
  - 예상: Medium

### 테스팅 (Testing)
- [ ] **Admin 인증 플로우 E2E 테스트**
  - 보호된 라우트의 401/403 응답 테스트 없음
  - 해결: 모든 admin API에 인증 실패 테스트 추가
  - 예상: Large

- [ ] **Admin CRUD 작업 E2E 테스트**
  - cells, members, sessions, users, prayer 페이지 CRUD 미테스트
  - 해결: 각 admin 페이지별 생성/수정/삭제 테스트 추가
  - 예상: Large

### 코드 품질 (Code Quality)
- [ ] **미사용 변수 정리** - ESLint 경고 16개
  - `handleLogout` 4개 페이지에서 미사용
  - `router`, `collapsedCells`, `bulkUpdate` 등 미사용
  - 해결: 변수 제거 또는 로그아웃 버튼 UI 구현
  - 예상: Small

- [ ] **에러 핸들링 패턴 통일**
  - try/catch, .catch(), ?. 혼용
  - 해결: 표준 에러 핸들링 패턴 정의 및 적용
  - 예상: Medium

- [ ] **TypeScript strict 모드 활성화**
  - `any` 타입, 느슨한 캐스팅 다수
  - 해결: tsconfig에서 `strict: true` 활성화 후 타입 오류 수정
  - 예상: Large

---

## P1 - 높음 (High Priority)

### 테스팅
- [ ] 셀 관리 E2E 테스트 (`/admin/cells`)
- [ ] 교인 관리 E2E 테스트 (`/admin/members`)
- [ ] 기도회 관리 E2E 테스트 (`/admin/prayer`)
- [ ] 계정 관리 E2E 테스트 (`/admin/users`)
- [ ] 출석 워크플로우 E2E 테스트 (출석 체크, PDF 내보내기)
- [ ] API 통합 테스트 (Jest/Vitest)
- [ ] 에러 응답 테스트 (400, 401, 403, 404, 500)
- [ ] 모바일 반응형 자동화 테스트 (375px 뷰포트)

### 보안
- [ ] **쿠키 secure 플래그** - `src/app/api/session/route.ts:28`
  - `secure: false`로 HTTP에서 쿠키 노출
  - 해결: 프로덕션에서 `secure: true` (HTTPS 필요)

- [ ] **입력 값 서버사이드 검증**
  - 사용자 입력이 검증 없이 JSON 저장됨
  - 해결: 모든 API에 입력 검증 추가

- [ ] **DELETE 작업 권한 검증 강화**
  - 소유자/관리자 검증 부족
  - 해결: 삭제 전 권한 검증 로직 추가

- [ ] **감사 로그 추가**
  - 민감한 작업에 대한 로그 없음
  - 해결: 계정 생성, 비밀번호 변경, 데이터 삭제 로깅

### 코드 품질
- [ ] **API 응답 형식 통일**
  - `{ ok: true }` vs `{ success: true }` 혼용
  - 해결: `{ ok: true, data?: T }` 형식으로 통일

- [ ] **하드코딩된 문자열 상수화**
  - 한국어 에러 메시지, 색상 코드 산재
  - 해결: constants 또는 i18n 모듈로 추출

- [ ] **입력 검증 유틸리티 함수**
  - 날짜 검증, 문자열 트림 등 중복 로직
  - 해결: shared validation utilities 모듈 생성

- [ ] **API 라우트 JSDoc 문서화**
  - API 파라미터, 응답, 에러 문서 없음

- [ ] **네이밍 컨벤션 통일**
  - `cellId` vs `memberId` vs `id` 혼용

### UX/접근성
- [ ] **로딩 스켈레톤 UI**
  - "데이터를 불러오는 중..." 텍스트만 표시
  - 해결: 리스트, 폼에 스켈레톤 로더 적용

- [ ] **에러 메시지 개선**
  - "데이터 로드 실패" 등 모호한 메시지
  - 해결: 구체적인 에러 원인과 해결 방법 안내

- [ ] **다크 모드 지원**
  - 라이트 테마만 지원
  - 해결: Tailwind `dark:` 변형 사용

### 인프라
- [ ] **헬스체크 엔드포인트**
  - Docker가 `/login` 페이지로 헬스체크
  - 해결: `/api/health` 엔드포인트 생성

- [ ] **데이터 백업/내보내기 기능**
  - JSON 파일 직접 접근 외 방법 없음
  - 해결: `/api/export` 엔드포인트 추가

- [ ] **환경변수 문서화**
  - 필수/선택 환경변수 문서 없음
  - 해결: `.env.example` 파일 생성

---

## P2 - 중간 (Medium Priority)

### 테스팅
- [ ] 접근성 테스트 (axe-accessibility)
- [ ] 성능 벤치마크 테스트 (Lighthouse)
- [ ] 데이터 유효성 검사 테스트

### UX
- [ ] 폼 autofocus 및 키보드 단축키

### 성능
- [ ] **데이터 스토어 최적화** - `src/lib/data-store.ts`
  - 매 작업마다 전체 JSON 파일 읽기/쓰기
  - 해결: SQLite 또는 메모리 캐시 + 주기적 저장

- [ ] **API 응답 캐싱**
  - 페이지 로드마다 모든 데이터 재요청
  - 해결: 클라이언트 캐싱 + revalidation 전략

---

## 구현 로드맵

### Phase 1 - 보안 (1-2주)
1. 평문 비밀번호 제거
2. CSRF 보호 추가
3. 세션 시크릿 검증
4. 레이트 리미팅 구현

### Phase 2 - 테스팅 (2-3주)
1. Admin 작업 E2E 테스트
2. API 통합 테스트
3. 에러 핸들링 테스트

### Phase 3 - 코드 품질 (1-2주)
1. 미사용 변수 정리
2. 에러 핸들링 통일
3. TypeScript strict 모드

### Phase 4 - UX & 성능 (2-3주)
1. 스켈레톤 로더
2. 캐싱 구현
3. 헬스 엔드포인트

---

## 즉시 실행 항목

1. **오늘**: `passwordPlain` 필드 제거
2. **이번 주**: CSRF 보호, 레이트 리미팅
3. **다음 주**: Admin E2E 테스트 확대
4. **지속적**: TypeScript strict 모드 활성화

---

*마지막 업데이트: 2025-11-25*
