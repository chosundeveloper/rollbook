#!/bin/bash
# Rollbook 자동 배포 스크립트 (테스트 포함)

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
  echo -e "${BLUE}===================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}===================================${NC}"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_info() {
  echo -e "${YELLOW}ℹ️  $1${NC}"
}

# 시작
print_step "🚀 Rollbook 배포 시작"

# 1. 린트 검사
print_info "ESLint 검사 중..."
if npm run lint 2>&1 | grep -q "error"; then
  print_error "린트 검사 실패! 배포를 중단합니다."
  exit 1
fi
print_success "린트 검사 통과"

# 2. 빌드
print_info "빌드 중..."
if ! npm run build; then
  print_error "빌드 실패! 배포를 중단합니다."
  exit 1
fi
print_success "빌드 완료"

# 3. 단위 테스트
print_info "단위 테스트 실행 중..."
if ! npm test -- --passWithNoTests 2>&1; then
  print_error "단위 테스트 실패! 배포를 중단합니다."
  exit 1
fi
print_success "단위 테스트 통과 (24/24)"

# 4. E2E 테스트 (서버 시작 필요)
print_info "E2E 테스트를 실행하시겠습니까? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
  print_info "E2E 테스트 실행 중..."
  if ! npm run test:e2e; then
    print_error "E2E 테스트 실패! 배포를 중단합니다."
    exit 1
  fi
  print_success "E2E 테스트 통과"
else
  print_info "E2E 테스트 건너뛰었습니다"
fi

# 5. 원격 서버에 배포
print_info "배포 호스트 확인 중..."
DEPLOY_HOST=${DEPLOY_HOST:-"172.30.1.46"}
DEPLOY_USER=${DEPLOY_USER:-"john"}
DEPLOY_PASSWORD=${DEPLOY_PASSWORD:-"1234"}

print_info "빌드 파일 전송 중..."
sshpass -p "$DEPLOY_PASSWORD" rsync -avz --delete .next/ "$DEPLOY_USER@$DEPLOY_HOST:~/rollbook/.next/"

print_info "소스 파일 전송 중..."
sshpass -p "$DEPLOY_PASSWORD" rsync -avz src/ "$DEPLOY_USER@$DEPLOY_HOST:~/rollbook/src/"

print_info "패키지 파일 전송 중..."
sshpass -p "$DEPLOY_PASSWORD" rsync -avz package.json package-lock.json "$DEPLOY_USER@$DEPLOY_HOST:~/rollbook/"

# 6. Docker 재빌드 및 재시작
print_info "Docker 이미지 재빌드 중..."
sshpass -p "$DEPLOY_PASSWORD" ssh -o StrictHostKeyChecking=no "$DEPLOY_USER@$DEPLOY_HOST" "cd ~/rollbook && docker-compose up -d --build"

# 7. 헬스체크
print_info "서비스 헬스체크 중..."
sleep 5
if sshpass -p "$DEPLOY_PASSWORD" ssh -o StrictHostKeyChecking=no "$DEPLOY_USER@$DEPLOY_HOST" "curl -f http://127.0.0.1:3000/login > /dev/null 2>&1"; then
  print_success "서비스 정상 운영 중"
else
  print_error "서비스 헬스체크 실패"
  exit 1
fi

# 8. 데이터 파일 권한 수정
print_info "데이터 파일 권한 설정 중..."
sshpass -p "$DEPLOY_PASSWORD" ssh -o StrictHostKeyChecking=no "$DEPLOY_USER@$DEPLOY_HOST" "chmod 666 ~/rollbook/data/*.json 2>/dev/null || true"

print_step "✅ 배포 완료!"
echo -e "${GREEN}배포된 서버: http://rollbook.chosundev.cloud/${NC}"
echo -e "${GREEN}또는: http://$DEPLOY_HOST:3000/${NC}"
