#!/bin/bash
# Jenkins 없이 수동 빌드 및 배포 스크립트

set -e

echo "🔨 Rollbook 빌드 및 배포 시작..."
echo "================================"

APP_DIR="/home/john/rollbook"

cd $APP_DIR

echo "📥 최신 코드 가져오기..."
git pull origin main

echo "📦 의존성 설치..."
npm ci

echo "🔨 Next.js 빌드..."
npm run build

echo "🚀 Docker 재시작..."
docker restart rollbook

echo ""
echo "✅ 빌드 및 배포 완료!"
echo "================================"
echo "확인: http://172.30.1.46:3000"
