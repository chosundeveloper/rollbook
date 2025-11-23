# 2청년부 출석부

웹에서 2청년부의 예배 출석을 관리할 수 있는 Next.js 앱입니다. 이름 옆에서 온라인/오프라인/결석을 선택하고, 방문자 등록과 메모 작성, 주차별 통계 확인을 한 화면에서 처리할 수 있도록 구성했습니다.

## 주요 기능
- 멤버 목록을 기반으로 주차별 온라인/오프라인/결석 상태를 빠르게 기록
- 방문자(새가족) 추가와 개별 상태 관리, 메모 입력 지원
- 상단 카드에서 온라인/오프라인/결석 인원과 총원 실시간 요약
- 현재 화면 상태 그대로 `PDF 다운로드` 가능 (보고용 출력)
- 데이터는 `data/` 폴더의 JSON 파일에 저장되어 서버 재시작 후에도 유지
- `/api/members`, `/api/attendance` API를 통해 다른 채널과도 연동 가능
- 관리자 계정을 사전에 발급받아 로그인해야만 이용 가능
- 예배가 있는 날에만 관리자가 직접 출석부(세션)를 생성해 필요할 때만 기록
- `/cells` 페이지에서 셀장/부셀장/셀원 배치표를 확인 가능
 - `/admin` 페이지에서 출석 생성 및 전체 현황 관리, `/cell` 페이지는 셀장 제출 전용

## 기술 스택
- [Next.js 15 (App Router)](https://nextjs.org/) + TypeScript
- Tailwind CSS v4 스타일 임포트(`@import "tailwindcss";`)
- 파일 기반 저장(JSON) + 간단한 Repository 레이어(`src/lib/data-store.ts`)
- ESLint 9 + Flat Config, npm scripts(`dev`, `build`, `start`, `lint`)

## 프로젝트 구조
```
src/
  app/
    api/              # 멤버/출석 REST 엔드포인트
    layout.tsx        # 메타데이터와 전역 레이아웃
    page.tsx          # 메인 페이지 (AttendanceBoard 사용)
  components/
    attendance-board.tsx
  lib/
    data-store.ts     # JSON 저장소 유틸
  types/
    attendance.ts     # 타입 정의
```
`data/members.json`에서 청년 명단과 소속팀 등을 수정할 수 있으며, 출석 데이터는 `data/attendance.json`에 누적됩니다. 출석부 일정(세션)은 `data/sessions.json`에 저장되고, 관리자 계정은 `data/users.json`에 저장되며 제공된 스크립트(`npm run user:add`)로 안전하게 추가할 수 있습니다.

## 개발 환경
1. Node.js 18 이상을 사용하세요. (프로젝트는 Next 15.5.6 기준)
2. `.env` 파일을 만들고 세션 서명 시크릿을 설정하세요.
   ```bash
   cp .env.example .env
   # vi .env 등으로 값 변경 (ROLLBOOK_SESSION_SECRET 필수)
   ```
   - 개발/테스트 중 로그인 없이 확인하려면 `NEXT_PUBLIC_AUTH_DISABLED=true`로 둡니다. 배포 시에는 `false`로 바꿔 인증을 활성화하세요.
3. 관리자 계정을 생성하세요(운영자가 직접 발급, 회원가입 없음).
   ```bash
   npm run user:add <username> [displayName]
   ```
   > 실행 후 `data/users.json`에 bcrypt 해시가 저장됩니다.
4. 의존성 설치
   ```bash
   npm install
   ```
5. 개발 서버 실행
   ```bash
   npm run dev
   # http://localhost:3000 접속
   ```
6. 관리자 흐름
   - `http://localhost:3000/admin` 에서 로그인 → 출석부 생성 및 전체 셀 출석 입력
   - `http://localhost:3000/cells` 에서 셀 배치표 확인
7. 셀장 흐름
   - `http://localhost:3000/cell` 에서 로그인 → 셀 카드별 출석을 체크 후 하단 “출석 저장” 버튼으로 제출
8. 린트/빌드
   ```bash
   npm run lint
   npm run build
   npm run start   # 프로덕션 모드, build 이후
   ```

## API 요약
| Method | Path             | 설명 |
| ------ | ---------------- | ---- |
| GET    | `/api/members`   | 활성 멤버 목록 반환 |
| POST   | `/api/members`   | `{ name, team?, contact?, role? }`로 새 멤버 추가 |
| GET    | `/api/attendance?date=YYYY-MM-DD` | 해당 날짜 출석/요약 반환 |
| PUT    | `/api/attendance` | `{ date, entries: [{ memberId?, displayName?, status, note? }] }` 저장 |
| GET    | `/api/sessions`   | 생성된 출석부(예배) 목록 반환 |
| POST   | `/api/sessions`   | `{ date, title? }`로 새 출석부 생성 |
| POST   | `/api/session`    | `{ username, password }`로 로그인, HTTP-only 쿠키 발급 |
| DELETE | `/api/session`    | 세션 쿠키 삭제(로그아웃) |

프론트엔드에서 저장 버튼을 누르면 모든 멤버/방문자 상태를 한 번에 `PUT /api/attendance`로 전달합니다. 파일 기반이므로 Git으로도 변경 이력을 추적할 수 있습니다.

## 배포 안내 (ssh john@172.30.1.46)
1. 로컬에서 빌드 산출물 생성
   ```bash
   npm install
   npm run build
   ```
2. 서버에 배포용 디렉터리 생성 (예: `/srv/rollbook`)
   ```bash
   ssh john@172.30.1.46 "mkdir -p /srv/rollbook"
   ```
3. 빌드 파일과 package.json 등을 전송 (rsync 또는 scp)
   ```bash
   rsync -av --delete \
     .next package.json package-lock.json public data src tsconfig.json \
     john@172.30.1.46:/srv/rollbook/
   ```
   > 서버에서 데이터를 계속 보존하려면 `/srv/rollbook/data` 만은 덮어쓰지 않도록 분리 복사해도 됩니다.
4. 서버에서 `.env`를 배치(또는 환경 변수 export)한 뒤 의존성 설치 및 프로덕션 서버 실행
   ```bash
   ssh john@172.30.1.46 "cd /srv/rollbook && npm install --omit=dev && npm run start"
   ```
   필요시 `pm2`, `systemd` 등을 사용해 서비스로 등록하면 됩니다.

이 과정을 자동화하고 싶다면 GitHub Actions에서 빌드 후 `rsync`로 해당 호스트에 배포하도록 스크립트를 추가할 수 있습니다.
