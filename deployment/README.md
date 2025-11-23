# 🚀 Rollbook 배포 가이드

## 📋 배포 순서

### 1️⃣ 서버 초기 설정 (최초 1회만)

서버에 SSH 접속:
```bash
ssh john@172.30.1.46
```

서버 설정 스크립트 실행:
```bash
# 로컬에서 서버로 스크립트 전송
scp deployment/server-setup.sh john@172.30.1.46:~/

# 서버에서 실행
ssh john@172.30.1.46
chmod +x server-setup.sh
sudo ./server-setup.sh
```

### 2️⃣ Traefik 설정 (최초 1회만)

로컬에서 실행:
```bash
cd deployment
./setup-traefik.sh
```

**중요:** 서버에서 이메일 주소 변경:
```bash
ssh john@172.30.1.46
nano /srv/traefik/traefik-data/traefik.yml
# your-email@example.com을 실제 이메일로 변경
cd /srv/traefik
docker-compose restart
```

### 3️⃣ Rollbook 배포

로컬에서 실행:
```bash
cd deployment
./deploy.sh
```

### 4️⃣ 도메인 설정 (선택)

**도메인이 있는 경우:**

1. DNS 설정:
   - A Record: `yourdomain.com` → `172.30.1.46`
   - CNAME: `rollbook.yourdomain.com` → `yourdomain.com`

2. `docker-compose.yml` 수정:
   ```yaml
   - "traefik.http.routers.rollbook.rule=Host(`rollbook.yourdomain.com`)"
   ```

3. 재배포:
   ```bash
   ./deploy.sh
   ```

**도메인이 없는 경우:**
- HTTP: `http://172.30.1.46` (Traefik이 자동으로 첫 서비스로 라우팅)
- 또는 `docker-compose.yml`에서 PathPrefix 설정

## 🔍 배포 확인

```bash
# 서버 접속
ssh john@172.30.1.46

# 컨테이너 상태 확인
cd /srv/projects/rollbook
docker-compose ps

# 로그 확인
docker-compose logs -f

# Traefik 상태 확인
cd /srv/traefik
docker-compose ps
docker-compose logs traefik
```

## 🔧 관리 명령어

```bash
# 프로젝트 재시작
ssh john@172.30.1.46
cd /srv/projects/rollbook
docker-compose restart

# 프로젝트 중지
docker-compose stop

# 프로젝트 다시 빌드
docker-compose up -d --build

# 환경변수 변경 후 재시작
nano .env
docker-compose down
docker-compose up -d
```

## 📁 서버 파일 구조

```
/srv/
├── traefik/
│   ├── docker-compose.yml
│   └── traefik-data/
│       ├── traefik.yml    # Traefik 설정
│       ├── config.yml     # 미들웨어 설정
│       └── acme.json      # SSL 인증서
└── projects/
    └── rollbook/
        ├── Dockerfile
        ├── docker-compose.yml
        ├── .env           # 환경변수
        ├── data/          # 데이터 (영구 보존)
        └── ... (소스코드)
```

## ⚡ 새 프로젝트 추가

다른 프로젝트를 배포하려면 `PROJECT_TEMPLATE.md` 참고

## 🐛 트러블슈팅

### 컨테이너가 시작되지 않음
```bash
ssh john@172.30.1.46
cd /srv/projects/rollbook
docker-compose logs
```

### SSL 인증서 발급 안 됨
1. DNS 확인
2. 80, 443 포트 열려있는지 확인
3. Traefik 로그: `docker logs traefik`

### 데이터가 사라짐
- Volume 마운트 확인: `docker-compose config`
- 데이터는 `/srv/projects/rollbook/data/`에 보존됨

### 배포 후 변경사항 반영 안 됨
```bash
# 강제 재빌드
./deploy.sh
# 또는 서버에서
docker-compose up -d --build --force-recreate
```
