#!/bin/bash
# Rollbook 자동 배포 스크립트

set -e

echo "🚀 Rollbook 배포 시작..."
echo "================================"

# 1. 테스트 실행 (실패 시 배포 중단)
echo "🧪 테스트 실행 중..."
npm run test:e2e
if [ $? -ne 0 ]; then
  echo "❌ 테스트 실패! 배포를 중단합니다."
  exit 1
fi
echo "✅ 테스트 통과!"

# 2. 로컬 빌드
echo "🔨 빌드 중..."
npm run build

# 2. 빌드 결과물 전송
echo "📦 빌드 파일 전송 중..."
sshpass -p '1234' rsync -avz --delete .next/ john@172.30.1.46:~/rollbook/.next/

echo "📄 소스 파일 전송 중..."
sshpass -p '1234' rsync -avz src/ john@172.30.1.46:~/rollbook/src/

# 3. Docker 이미지 재빌드 및 재시작
echo "🔄 Docker 이미지 재빌드 중..."
sshpass -p '1234' ssh -o StrictHostKeyChecking=no john@172.30.1.46 "cd ~/rollbook && docker-compose up -d --build"

# 4. 데이터 파일 권한 수정
echo "🔐 데이터 파일 권한 설정 중..."
sshpass -p '1234' ssh -o StrictHostKeyChecking=no john@172.30.1.46 "chmod 666 ~/rollbook/data/*.json 2>/dev/null || true"

echo ""
echo "✅ 배포 완료!"
echo "================================"
echo "확인: http://172.30.1.46/"
