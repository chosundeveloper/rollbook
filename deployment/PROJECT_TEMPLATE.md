# 새 프로젝트 추가 가이드

## 📋 프로젝트 배포 3단계

### 1️⃣ 프로젝트에 Docker 설정 추가

#### Next.js 프로젝트
```dockerfile
# Dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  myproject:
    build: .
    container_name: myproject
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.myproject.rule=Host(`myproject.yourdomain.com`)"
      - "traefik.http.routers.myproject.entrypoints=websecure"
      - "traefik.http.routers.myproject.tls.certresolver=letsencrypt"
      - "traefik.http.services.myproject.loadbalancer.server.port=3000"
    networks:
      - traefik-network

networks:
  traefik-network:
    external: true
```

#### Express/Node.js 백엔드
```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4000
CMD ["node", "index.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    container_name: myapi
    restart: unless-stopped
    environment:
      - PORT=4000
      - NODE_ENV=production
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.myapi.rule=Host(`api.yourdomain.com`)"
      - "traefik.http.routers.myapi.entrypoints=websecure"
      - "traefik.http.routers.myapi.tls.certresolver=letsencrypt"
      - "traefik.http.services.myapi.loadbalancer.server.port=4000"
    networks:
      - traefik-network

networks:
  traefik-network:
    external: true
```

### 2️⃣ 배포 스크립트 생성

```bash
# deploy.sh
#!/bin/bash
set -e

PROJECT_NAME="myproject"
SERVER_USER="john"
SERVER_HOST="172.30.1.46"
SERVER_PATH="/srv/projects/${PROJECT_NAME}"

echo "🚀 Deploying ${PROJECT_NAME}..."

# 서버에 디렉토리 생성
ssh ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${SERVER_PATH}"

# 파일 전송
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
    ./ ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/

# 배포
ssh ${SERVER_USER}@${SERVER_HOST} << EOF
cd ${SERVER_PATH}
docker-compose down
docker-compose up -d --build
docker-compose logs --tail=50
EOF

echo "✅ Deployment complete!"
```

```bash
chmod +x deploy.sh
./deploy.sh
```

### 3️⃣ DNS 설정 (선택)

도메인이 있다면:
```
A Record: yourdomain.com → 172.30.1.46
CNAME: *.yourdomain.com → yourdomain.com
```

도메인 없이 IP만 사용:
```yaml
# docker-compose.yml에서
- "traefik.http.routers.myproject.rule=Host(`172.30.1.46`) && PathPrefix(`/myproject`)"
```

## 🔧 서버에서 관리

### 프로젝트 상태 확인
```bash
ssh john@172.30.1.46
cd /srv/projects/myproject
docker-compose ps
docker-compose logs -f
```

### 프로젝트 중지/시작
```bash
docker-compose stop
docker-compose start
docker-compose restart
```

### 프로젝트 제거
```bash
docker-compose down
cd .. && rm -rf myproject
```

## 📁 서버 디렉토리 구조
```
/srv/
├── traefik/              # Traefik (리버스 프록시)
│   ├── docker-compose.yml
│   └── traefik-data/
├── projects/
│   ├── rollbook/         # 프로젝트 1
│   │   ├── Dockerfile
│   │   ├── docker-compose.yml
│   │   └── data/         # 영구 데이터
│   ├── blog/             # 프로젝트 2
│   └── api/              # 프로젝트 3
```

## ⚡ 빠른 체크리스트

새 프로젝트 배포시:
- [ ] Dockerfile 생성
- [ ] docker-compose.yml 생성 (Traefik 라벨 포함)
- [ ] next.config에 `output: 'standalone'` 추가 (Next.js인 경우)
- [ ] deploy.sh 생성 및 실행
- [ ] DNS 설정 (도메인 사용시)
- [ ] 서버에서 로그 확인

## 🔍 트러블슈팅

**컨테이너가 시작 안 됨:**
```bash
docker-compose logs
```

**Traefik 라우팅 안 됨:**
```bash
docker logs traefik
# 라벨 확인
docker inspect myproject | grep traefik
```

**SSL 인증서 발급 안 됨:**
- DNS가 제대로 설정되었는지 확인
- 80, 443 포트가 열려있는지 확인
- Traefik 로그 확인: `docker logs traefik`
