#!/bin/bash

# 서버 초기 설정 스크립트 (서버에서 실행)
set -e

echo "🔧 Setting up multi-project server..."

# 1. Docker 설치 확인
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $USER
    rm get-docker.sh
    echo "✅ Docker installed"
else
    echo "✅ Docker already installed"
fi

# 2. Docker Compose 설치 확인
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed"
else
    echo "✅ Docker Compose already installed"
fi

# 3. 프로젝트 디렉토리 구조 생성
echo "📁 Creating project directories..."
mkdir -p /srv/projects
mkdir -p /srv/traefik/traefik-data

# 4. Traefik 설정
echo "🔧 Setting up Traefik..."
cd /srv/traefik

# acme.json 파일 생성 (SSL 인증서 저장)
touch traefik-data/acme.json
chmod 600 traefik-data/acme.json

echo "✅ Server setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy traefik configuration files to /srv/traefik/traefik-data/"
echo "2. Edit /srv/traefik/traefik-data/traefik.yml and set your email"
echo "3. Start Traefik: cd /srv/traefik && docker-compose up -d"
echo "4. Deploy your first project"
