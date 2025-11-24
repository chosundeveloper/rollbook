#!/bin/bash
# Rollbook 자동 배포 스크립트

set -e

echo "🚀 Rollbook 배포 시작..."
echo "================================"

# 1. 로컬 빌드
echo "🔨 빌드 중..."
npm run build

# 2. 빌드 결과물 전송
echo "📦 빌드 파일 전송 중..."
sshpass -p '1234' rsync -avz --delete .next/ john@172.30.1.46:~/rollbook/.next/

echo "📄 소스 파일 전송 중..."
sshpass -p '1234' rsync -avz src/ john@172.30.1.46:~/rollbook/src/

# 3. Docker 재시작
echo "🔄 서버 재시작 중..."
sshpass -p '1234' ssh -o StrictHostKeyChecking=no john@172.30.1.46 "cd ~/rollbook && docker-compose restart"

echo ""
echo "✅ 배포 완료!"
echo "================================"
echo "확인: http://172.30.1.46/"
