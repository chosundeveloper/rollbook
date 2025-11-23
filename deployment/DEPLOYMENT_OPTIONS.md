# 배포 방법 비교

## 🎯 배포 옵션 3가지

### 1️⃣ GitHub Actions 자동 배포 (권장 ⭐)

**작동 방식:**
```
로컬 코드 수정 → git push → GitHub Actions → SSH로 서버 배포
```

**장점:**
- ✅ 완전 자동화 (main 브랜치 푸시만 하면 끝)
- ✅ 배포 이력 관리 (GitHub Actions 로그)
- ✅ 롤백 쉬움 (이전 커밋으로 돌리고 푸시)
- ✅ 팀 협업 용이 (누가 배포했는지 추적)
- ✅ 배포 전 테스트 자동 실행 가능

**단점:**
- ❌ 초기 설정 필요 (SSH 키, GitHub Secrets)
- ❌ GitHub Actions 사용량 제한 (무료: 2000분/월, 보통 충분함)

**설정 방법:** `GITHUB_ACTIONS_SETUP.md` 참고

**사용 시나리오:**
- 정규 개발 워크플로우
- 여러 명이 협업하는 프로젝트
- 배포 이력 관리가 중요한 경우

---

### 2️⃣ 로컬에서 직접 배포

**작동 방식:**
```
로컬에서 ./deployment/deploy.sh 실행 → SSH로 서버 배포
```

**장점:**
- ✅ 설정 간단 (SSH 접속만 되면 됨)
- ✅ 즉시 배포 가능
- ✅ GitHub Actions 사용량 소모 안 함
- ✅ 로컬에서 직접 제어

**단점:**
- ❌ 수동 실행 필요
- ❌ 배포 이력 관리 어려움
- ❌ 로컬 네트워크 환경에 의존

**사용 방법:**
```bash
cd deployment
./deploy.sh
```

**사용 시나리오:**
- 빠른 핫픽스
- 개인 프로젝트
- 일회성 배포

---

### 3️⃣ 서버에서 직접 Git Pull

**작동 방식:**
```
서버 접속 → git pull → docker-compose up -d --build
```

**장점:**
- ✅ 가장 간단 (추가 도구 없음)
- ✅ 네트워크 대역폭 절약

**단점:**
- ❌ 서버에 직접 접속 필요
- ❌ 매번 수동 작업
- ❌ 자동화 어려움

**사용 방법:**
```bash
ssh john@172.30.1.46
cd /srv/projects/rollbook
git pull origin main
docker-compose down
docker-compose up -d --build
```

**사용 시나리오:**
- 긴급 상황
- 배포 스크립트 문제 발생 시

---

## 🤔 어떤 방법을 선택할까?

### 추천 조합

**초기 개발:**
```
로컬 직접 배포 (deploy.sh)
    ↓ 프로젝트 안정화
GitHub Actions 자동 배포
```

**프로덕션:**
```
GitHub Actions 자동 배포 (기본)
+ 로컬 직접 배포 (긴급 핫픽스용)
```

### 상황별 추천

| 상황 | 추천 방법 | 이유 |
|------|----------|------|
| 혼자 개발하는 사이드 프로젝트 | 로컬 직접 배포 | 간단하고 빠름 |
| 팀 프로젝트 | GitHub Actions | 협업 & 이력 관리 |
| 빠른 핫픽스 | 로컬 직접 배포 | 즉시 배포 |
| 정기 배포 | GitHub Actions | 자동화 |
| 배포 실패 디버깅 | 서버에서 직접 | 직접 제어 |

---

## 📊 비교표

| 항목 | GitHub Actions | 로컬 배포 | 서버 직접 |
|------|----------------|-----------|-----------|
| 자동화 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐ |
| 설정 난이도 | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| 배포 속도 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 이력 관리 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐ |
| 협업 편의성 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐ |
| 비용 | 무료* | 무료 | 무료 |

*GitHub Actions 무료 플랜: 2000분/월

---

## 🚀 실전 워크플로우 예시

### 시나리오 1: 일반 개발
```bash
# 1. 기능 개발
git checkout -b feature/new-feature
# ... 코드 작성 ...

# 2. 커밋 & 푸시
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# 3. PR 생성 & 리뷰
# GitHub에서 Pull Request 생성

# 4. main에 머지
# PR 승인 후 Merge

# 5. 자동 배포 🎉
# GitHub Actions가 자동으로 배포
```

### 시나리오 2: 긴급 핫픽스
```bash
# 1. 긴급 수정
# ... 코드 수정 ...

# 2. 즉시 배포 (로컬)
cd deployment
./deploy.sh

# 3. 나중에 커밋
git add .
git commit -m "Hotfix: critical bug"
git push origin main
```

### 시나리오 3: 새 프로젝트 추가
```bash
# 1. 새 프로젝트 디렉토리
cd /path/to/new-project

# 2. Docker 설정 복사
cp ../rollbook/Dockerfile .
cp ../rollbook/docker-compose.yml .
# docker-compose.yml에서 프로젝트명, 포트, 도메인 변경

# 3. GitHub Actions 워크플로우 복사
cp -r ../rollbook/.github .
# 워크플로우 파일에서 경로 수정

# 4. 배포
git push origin main
# 또는
./deploy.sh
```

---

## 🔧 마이그레이션 가이드

### 로컬 배포 → GitHub Actions로 전환

1. SSH 키 생성 및 서버 등록
   ```bash
   ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions
   ssh-copy-id -i ~/.ssh/github_actions.pub john@172.30.1.46
   ```

2. GitHub Secrets 설정
   - Settings → Secrets → New secret

3. 워크플로우 파일 확인
   - `.github/workflows/deploy.yml`

4. 테스트 배포
   ```bash
   git commit --allow-empty -m "Test GitHub Actions deployment"
   git push origin main
   ```

5. GitHub Actions 탭에서 결과 확인

6. 성공하면 로컬 배포는 백업용으로 유지
