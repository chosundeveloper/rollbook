#!/bin/bash

# Traefik 설정 스크립트 (로컬에서 실행)
set -e

SERVER_USER="john"
SERVER_HOST="172.30.1.46"
TRAEFIK_PATH="/srv/traefik"

echo "🔧 Setting up Traefik on ${SERVER_HOST}..."

# 1. Traefik 설정 파일 전송
echo "📦 Transferring Traefik configuration..."
ssh ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${TRAEFIK_PATH}/traefik-data"

scp traefik-docker-compose.yml ${SERVER_USER}@${SERVER_HOST}:${TRAEFIK_PATH}/docker-compose.yml
scp traefik-data/traefik.yml ${SERVER_USER}@${SERVER_HOST}:${TRAEFIK_PATH}/traefik-data/
scp traefik-data/config.yml ${SERVER_USER}@${SERVER_HOST}:${TRAEFIK_PATH}/traefik-data/

# 2. acme.json 파일 생성
echo "🔒 Setting up SSL certificate storage..."
ssh ${SERVER_USER}@${SERVER_HOST} << 'EOF'
cd /srv/traefik/traefik-data
touch acme.json
chmod 600 acme.json
EOF

# 3. Docker 네트워크 생성
echo "🌐 Creating Docker network..."
ssh ${SERVER_USER}@${SERVER_HOST} "docker network create traefik-network 2>/dev/null || true"

# 4. Traefik 실행
echo "🚀 Starting Traefik..."
ssh ${SERVER_USER}@${SERVER_HOST} << 'EOF'
cd /srv/traefik
docker-compose up -d
docker-compose logs --tail=20
EOF

echo "✅ Traefik setup complete!"
echo ""
echo "⚠️  Important: Edit /srv/traefik/traefik-data/traefik.yml on server"
echo "    Change 'your-email@example.com' to your actual email"
echo ""
echo "🌐 Traefik is now running and ready for projects!"
