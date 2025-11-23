# 🚀 가장 쉬운 배포 방법 (5분 완성)

## 📋 전체 순서 (복사 붙여넣기만!)

### 1️⃣ SSH 키 생성 (로컬)

```bash
# SSH 키 생성
ssh-keygen -t ed25519 -f ~/.ssh/rollbook_deploy -N ""

# 서버에 복사
ssh-copy-id -i ~/.ssh/rollbook_deploy.pub john@172.30.1.46

# 테스트
ssh -i ~/.ssh/rollbook_deploy john@172.30.1.46 "echo 'Connected!'"
```

### 2️⃣ GitHub Secrets 추가

1. GitHub 저장소로 이동
2. **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

아래 5개 추가:

**SSH_PRIVATE_KEY:**
```bash
cat ~/.ssh/rollbook_deploy
```
출력된 전체 내용 복사 (-----BEGIN부터 -----END까지)

**나머지 4개:**
- `SERVER_HOST`: `172.30.1.46`
- `SERVER_USER`: `john`
- `SERVER_PATH`: `/srv/projects/rollbook`
- `ROLLBOOK_SESSION_SECRET`: 아래 명령어로 생성
  ```bash
  openssl rand -hex 32
  ```

### 3️⃣ 서버 초기 설정 (최초 1회만)

```bash
# 서버에 접속
ssh john@172.30.1.46

# Docker 설치
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 로그아웃 후 재접속 (Docker 그룹 적용)
exit
ssh john@172.30.1.46

# 디렉토리 생성
sudo mkdir -p /srv/projects /srv/traefik/traefik-data
sudo chown -R $USER:$USER /srv

# Docker 네트워크 생성
docker network create traefik-network

# 끝!
exit
```

### 4️⃣ Traefik 설치 (최초 1회만)

```bash
# 로컬에서 실행
cd /Users/john/projects/rollbook/deployment

# Traefik 설정 전송
scp traefik-docker-compose.yml john@172.30.1.46:/srv/traefik/docker-compose.yml
scp traefik-data/traefik.yml john@172.30.1.46:/srv/traefik/traefik-data/
scp traefik-data/config.yml john@172.30.1.46:/srv/traefik/traefik-data/

# 서버에서 Traefik 시작
ssh john@172.30.1.46 << 'EOF'
cd /srv/traefik/traefik-data
touch acme.json
chmod 600 acme.json
cd /srv/traefik
docker-compose up -d
EOF
```

### 5️⃣ 배포! (이제부터 이것만 하면 됨)

```bash
# 로컬에서 코드 수정 후
git add .
git commit -m "Update code"
git push origin main
```

**끝!** GitHub Actions가 자동으로 배포합니다.

---

## 🎯 완료 후 확인

GitHub 저장소 → **Actions** 탭 → 배포 진행 상황 확인

배포 완료되면 접속:
- HTTP: `http://172.30.1.46`
- HTTPS: 도메인 연결 후 `https://yourdomain.com`

---

## 🔄 이후 개발 워크플로우

```bash
# 1. 코드 수정
vim src/...

# 2. 로컬 테스트
npm run dev

# 3. 배포
git add .
git commit -m "Add feature"
git push origin main

# 끝! 자동 배포됨
```

---

## ⚡ 더 쉬운 방법 (수동 배포)

GitHub Actions 설정 귀찮으면:

```bash
# 1. 서버 초기 설정 (위의 3️⃣ 4️⃣ 실행)

# 2. 이후 배포
cd /Users/john/projects/rollbook/deployment
./deploy.sh
```

이것도 충분히 쉽습니다!

---

## 📊 비교

| 방법 | 초기 설정 | 배포 명령어 | 자동화 |
|------|----------|------------|--------|
| GitHub Actions | 5분 | `git push` | ✅ 자동 |
| 수동 스크립트 | 2분 | `./deploy.sh` | ❌ 수동 |

**추천:** GitHub Actions (5분 설정 후 영원히 편함)
