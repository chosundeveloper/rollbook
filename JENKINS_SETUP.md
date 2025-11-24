# Jenkins 자체 빌드 서버 설정 가이드

## ✅ 설치 완료!

Jenkins가 성공적으로 설치되었습니다.

**접속 정보:**
- 내부 URL: http://172.30.1.46:8080
- 외부 URL: http://221.158.18.47:8080
- 초기 비밀번호: `81687fcc1ea34d2195849d39e3663f20`

**⚠️ 보안 경고:**
- Jenkins가 외부 인터넷에 노출되어 있습니다!
- 반드시 아래 보안 강화 섹션을 먼저 설정하세요!

---

## 🔐 긴급 보안 강화 (먼저 설정!)

### 1️⃣ 방화벽 설정 (가장 중요!)

Jenkins는 현재 **전 세계에 공개**되어 있습니다. 반드시 방화벽을 설정하세요!

#### 옵션 A: 특정 IP만 허용 (가장 안전)
```bash
# 서버에서 실행
ssh john@172.30.1.46

# 현재 IP 확인 (접속할 IP)
curl ifconfig.me

# iptables로 특정 IP만 허용
sudo iptables -A INPUT -p tcp --dport 8080 -s YOUR_IP_ADDRESS -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 8080 -j DROP

# 설정 저장
sudo iptables-save > /etc/iptables/rules.v4
```

#### 옵션 B: 내부 네트워크만 허용
```bash
# 172.30.1.0/24 네트워크만 허용
sudo iptables -A INPUT -p tcp --dport 8080 -s 172.30.1.0/24 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 8080 -j DROP
```

#### 옵션 C: 외부 포트 차단 (Docker)
```bash
# Jenkins 컨테이너 재생성 (외부 포트 바인딩 제거)
docker rm -f jenkins

docker run -d \
  --name jenkins \
  --restart=unless-stopped \
  -p 127.0.0.1:8080:8080 \  # localhost만 접근 가능
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts

# 이후 SSH 터널링으로 접속
ssh -L 8080:localhost:8080 john@221.158.18.47
# 로컬에서 http://localhost:8080 접속
```

### 2️⃣ Jenkins 보안 설정

초기 설정 완료 후 **즉시** 설정:

1. **Manage Jenkins** → **Configure Global Security**
2. **Security Realm**: Jenkins' own user database
3. **Authorization**: Logged-in users can do anything
4. ⚠️ **Allow users to sign up 체크 해제** (중요!)
5. **Save**

### 3️⃣ 강력한 비밀번호 설정

```
Admin 계정:
- Username: admin
- Password: 최소 16자, 대소문자+숫자+특수문자
- 예: Jenkins2025!@#Rollbook$%^
```

### 4️⃣ API Token 보호

- **Manage Jenkins** → **Configure System**
- **CSRF Protection** 활성화 (기본 활성화됨)
- **Prevent Cross Site Request Forgery exploits** 체크

### 5️⃣ Nginx 리버스 프록시 + HTTPS (권장)

```bash
# Nginx 설치
sudo apt install nginx certbot python3-certbot-nginx

# Nginx 설정
sudo nano /etc/nginx/sites-available/jenkins

# 내용:
server {
    listen 80;
    server_name jenkins2025.yourdomain.com;

    # HTTP를 HTTPS로 리다이렉트
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name jenkins2025.yourdomain.com;

    # Let's Encrypt SSL 인증서
    ssl_certificate /etc/letsencrypt/live/jenkins2025.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/jenkins2025.yourdomain.com/privkey.pem;

    # 보안 헤더
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Websocket 지원 (Jenkins 실시간 로그)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# 활성화
sudo ln -s /etc/nginx/sites-available/jenkins /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL 인증서 발급 (무료)
sudo certbot --nginx -d jenkins2025.yourdomain.com
```

### 6️⃣ Fail2Ban 설치 (무차별 대입 공격 방지)

```bash
# Fail2Ban 설치
sudo apt install fail2ban

# Jenkins 필터 생성
sudo nano /etc/fail2ban/filter.d/jenkins.conf

[Definition]
failregex = ^.*Failed login attempt.*from <HOST>.*$
ignoreregex =

# Jail 설정
sudo nano /etc/fail2ban/jail.local

[jenkins]
enabled = true
port = 8080
filter = jenkins
logpath = /var/lib/docker/volumes/jenkins_home/_data/logs/jenkins.log
maxretry = 5
bantime = 3600

# 재시작
sudo systemctl restart fail2ban
```

### 7️⃣ 정기 보안 업데이트

```bash
# 매주 자동 업데이트 (cron)
0 3 * * 0 docker pull jenkins/jenkins:lts && docker restart jenkins
```

---

## 📋 초기 설정 단계

### 1. Jenkins 웹 접속

1. 브라우저에서 http://172.30.1.46:8080 접속
2. 초기 비밀번호 입력: `81687fcc1ea34d2195849d39e3663f20`

### 2. 플러그인 설치

**"Install suggested plugins" 선택** (추천 플러그인 자동 설치)

설치될 주요 플러그인:
- Git
- GitHub
- Pipeline
- NodeJS
- Docker Pipeline

**설치 시간:** 약 5-10분 소요

### 3. Admin 계정 생성

```
Username: admin
Password: (원하는 비밀번호)
Full name: Rollbook Admin
E-mail: admin@rollbook.local
```

### 4. Jenkins URL 확인

```
Jenkins URL: http://172.30.1.46:8080/
```

"Save and Finish" 클릭

---

## 🔧 필수 플러그인 설치

### NodeJS 플러그인 설정

1. **Manage Jenkins** → **Manage Plugins** → **Available** 탭
2. 검색: `NodeJS`
3. **NodeJS Plugin** 체크 → **Install without restart**

설치 후:
1. **Manage Jenkins** → **Tools**
2. **NodeJS installations** → **Add NodeJS**
   - Name: `Node 20`
   - Version: `NodeJS 20.x`
   - Install automatically 체크
3. **Save**

---

## 🚀 첫 번째 파이프라인 생성

### 방법 1: GitHub 저장소 연동 (추천)

#### A. GitHub Personal Access Token 생성

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. **Generate new token (classic)**
3. 권한 선택:
   - `repo` (전체 체크)
   - `admin:repo_hook` (webhook 설정용)
4. 토큰 복사 (한 번만 보여짐!)

#### B. Jenkins에서 Credential 등록

1. Jenkins → **Manage Jenkins** → **Credentials**
2. **Domains** → **(global)** → **Add Credentials**
3. 정보 입력:
   - Kind: `Username with password`
   - Username: `(GitHub 사용자명)`
   - Password: `(위에서 생성한 토큰)`
   - ID: `github-token`
   - Description: `GitHub Access Token`
4. **Create**

#### C. 새 Pipeline Job 생성

1. Jenkins 대시보드 → **New Item**
2. 이름 입력: `rollbook-pipeline`
3. **Pipeline** 선택 → **OK**

4. 설정:

**General:**
- Description: `Rollbook 자동 빌드 및 배포`
- GitHub project 체크
- Project url: `https://github.com/USERNAME/rollbook/` (본인 저장소)

**Build Triggers:**
- ✅ **GitHub hook trigger for GITScm polling** 체크

**Pipeline:**
- Definition: `Pipeline script from SCM`
- SCM: `Git`
- Repository URL: `https://github.com/USERNAME/rollbook.git`
- Credentials: `github-token` 선택
- Branch: `*/main`
- Script Path: `Jenkinsfile`

5. **Save**

---

### 방법 2: 로컬 Git 저장소 (간단)

서버 내부에 Git 저장소가 있다면:

```groovy
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: '/home/john/rollbook/.git'
            }
        }
        // ... 나머지 동일
    }
}
```

---

## 🔗 GitHub Webhook 설정 (자동 빌드)

### Jenkins에서 Webhook URL 확인

**내부 네트워크:**
```
http://172.30.1.46:8080/github-webhook/
```

**외부 인터넷 (GitHub에서 접근):**
```
http://221.158.18.47:8080/github-webhook/
```

⚠️ **주의:** 외부 URL 사용 시 보안 위험이 있습니다!

### 안전한 Webhook 설정 방법

#### 방법 1: GitHub Actions + Self-Hosted Runner (가장 안전)
```yaml
# .github/workflows/deploy.yml
jobs:
  deploy:
    runs-on: self-hosted  # Jenkins 서버에 Runner 설치
```

#### 방법 2: Webhook + Secret 토큰
1. Secret 토큰 생성:
```bash
openssl rand -hex 32
# 예: 8f3e9d2c1a7b5e4f6d8c9a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d
```

2. Jenkins 설정:
   - Job → Configure → Build Triggers
   - **Generic Webhook Trigger** 플러그인 설치 필요
   - Token: 위에서 생성한 토큰 입력

3. GitHub Webhook 설정:
   - Payload URL: `http://221.158.18.47:8080/generic-webhook-trigger/invoke?token=YOUR_TOKEN`
   - Content type: `application/json`
   - Secret: 위에서 생성한 토큰
   - Events: `Just the push event`

#### 방법 3: Polling (가장 간단하지만 느림)
Jenkins가 주기적으로 Git 저장소를 확인:
```
Job → Configure → Build Triggers
☑ Poll SCM
Schedule: H/5 * * * *  (5분마다 확인)
```

### GitHub 저장소에서 Webhook 설정 (방법 2 사용 시)

1. GitHub 저장소 → **Settings** → **Webhooks** → **Add webhook**
2. 설정:
   - Payload URL: `http://221.158.18.47:8080/github-webhook/` (또는 token URL)
   - Content type: `application/json`
   - Secret: `YOUR_SECRET_TOKEN`
   - Events: `Just the push event`
   - Active 체크
3. **Add webhook**

**이제 Git push하면 자동으로 빌드됩니다!** 🎉

⚠️ **보안 권장사항:**
- Webhook 사용 시 반드시 Secret 설정
- 가능하면 내부 네트워크에서만 접근하도록 방화벽 설정
- 또는 GitHub Actions Self-Hosted Runner 사용

---

## 🧪 첫 빌드 테스트

### 수동 실행:
1. Jenkins → `rollbook-pipeline` 클릭
2. **Build Now** 클릭
3. **Console Output** 에서 실시간 로그 확인

### 자동 실행 테스트:
```bash
# 로컬에서
git commit --allow-empty -m "Test Jenkins build"
git push origin main

# Jenkins에서 자동으로 빌드 시작됨!
```

---

## 📊 Jenkins 파이프라인 단계

현재 `Jenkinsfile` 구성:

```
1. Checkout     → Git에서 최신 코드 가져오기
2. Install      → npm ci (의존성 설치)
3. Build        → npm run build (Next.js 빌드)
4. Deploy       → rsync로 파일 복사 + Docker 재시작
5. Post Actions → 성공/실패 알림, 워크스페이스 정리
```

---

## 🛠️ 트러블슈팅

### 1. Jenkins가 Docker 명령어를 실행 못 함

**증상:** `docker: command not found`

**해결:**
```bash
# Jenkins 컨테이너에 Docker CLI 설치
sshpass -p '1234' ssh john@172.30.1.46 << 'EOF'
docker exec -u root jenkins sh -c '
  apt-get update
  apt-get install -y docker.io
  usermod -aG docker jenkins
'
docker restart jenkins
EOF
```

### 2. Permission denied (rsync 실패)

**해결:**
```bash
# Jenkins 유저가 rollbook 디렉토리 접근 가능하도록
ssh john@172.30.1.46 "chmod -R 755 ~/rollbook"
```

### 3. npm 명령어를 찾을 수 없음

**해결:**
- Jenkins 설정에서 NodeJS 플러그인 설치 확인
- Pipeline에 `tools { nodejs 'Node 20' }` 추가

### 4. GitHub Webhook이 작동 안 함

**확인사항:**
- Jenkins가 외부에서 접속 가능한지 (방화벽 확인)
- GitHub Webhook 설정에서 "Recent Deliveries" 확인
- Jenkins 로그 확인: `Manage Jenkins` → `System Log`

---

## 🔐 보안 강화 (선택사항)

### 1. Jenkins 계정 보호
```
Manage Jenkins → Configure Global Security
- Enable security 체크
- Jenkins' own user database 선택
- Allow users to sign up 체크 해제
```

### 2. GitHub Webhook Secret 설정
```bash
# Jenkins에서 Secret 설정
# Job 설정 → Build Triggers → GitHub hook trigger
# → Generic Webhook Trigger 플러그인 사용
```

### 3. HTTPS 설정 (Nginx 리버스 프록시)
```nginx
server {
    listen 443 ssl;
    server_name jenkins.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 📈 고급 기능 (나중에)

### 빌드 알림 (Slack/Discord)
```groovy
post {
    success {
        slackSend color: 'good',
                  message: "✅ Build #${env.BUILD_NUMBER} 성공!"
    }
}
```

### 멀티 브랜치 파이프라인
- develop, staging, main 브랜치별 자동 배포

### 병렬 빌드
```groovy
parallel {
    stage('Test') { ... }
    stage('Lint') { ... }
}
```

### 빌드 히스토리 보관
```groovy
options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
}
```

---

## 📚 다음 단계

1. ✅ Jenkins 웹 접속 (http://172.30.1.46:8080)
2. ✅ 초기 설정 완료
3. ✅ Pipeline Job 생성
4. ✅ 첫 빌드 실행
5. ⬜ GitHub Webhook 연동
6. ⬜ 자동 배포 테스트

---

## 🆘 도움말

**Jenkins 재시작:**
```bash
ssh john@172.30.1.46 "docker restart jenkins"
```

**Jenkins 로그 확인:**
```bash
ssh john@172.30.1.46 "docker logs -f jenkins"
```

**Jenkins 완전 삭제 (재설치):**
```bash
ssh john@172.30.1.46 "docker rm -f jenkins && docker volume rm jenkins_home"
```

---

**설치 완료!** 🎉

이제 http://172.30.1.46:8080 으로 접속하여 설정을 시작하세요!
