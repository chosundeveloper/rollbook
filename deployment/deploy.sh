#!/bin/bash

# 배포 스크립트
set -e

SERVER_USER="john"
SERVER_HOST="172.30.1.46"
SERVER_PATH="/srv/projects/rollbook"
PROJECT_NAME="rollbook"

echo "🚀 Deploying ${PROJECT_NAME} to ${SERVER_HOST}..."

# 1. 서버에 디렉토리 생성
echo "📁 Creating server directory..."
ssh ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${SERVER_PATH}"

# 2. 프로젝트 파일 전송
echo "📦 Transferring files..."
rsync -avz --exclude 'node_modules' \
           --exclude '.next' \
           --exclude '.git' \
           --exclude 'data' \
           --exclude 'deployment/traefik-data/acme.json' \
           ./ ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/

# 3. 환경 변수 설정
echo "⚙️  Setting up environment..."
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Using defaults."
fi

# 4. 서버에서 빌드 및 실행
echo "🔨 Building and starting on server..."
ssh ${SERVER_USER}@${SERVER_HOST} << 'EOF'
cd /srv/projects/rollbook

# data 디렉토리가 없으면 로컬 data 복사 (초기 배포시만)
if [ ! -d "data" ]; then
    echo "📋 Initializing data directory..."
    mkdir -p data
fi

# Docker 컨테이너 재시작
docker-compose down
docker-compose up -d --build

# 로그 확인
echo "📋 Deployment logs:"
docker-compose logs --tail=50
EOF

echo "✅ Deployment complete!"
echo "🌐 Check status: ssh ${SERVER_USER}@${SERVER_HOST} 'cd ${SERVER_PATH} && docker-compose ps'"
