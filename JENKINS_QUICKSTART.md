# Jenkins 빠른 시작 가이드 (5분 완성)

## 🚨 보안 먼저!

Jenkins가 **221.158.18.47:8080**으로 **전 세계에 공개**되어 있습니다!

### ⚡ 빠른 보안 설정 (3가지 방법)

#### 방법 1: 자동 스크립트 (가장 빠름)
```bash
chmod +x jenkins-security.sh
sshpass -p '1234' ssh john@221.158.18.47 < jenkins-security.sh
```

#### 방법 2: localhost만 허용 (가장 안전)
```bash
ssh john@221.158.18.47

# Jenkins 재생성
docker rm -f jenkins
docker run -d \
  --name jenkins \
  --restart=unless-stopped \
  -p 127.0.0.1:8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts

# 권한 설정
docker exec -u root jenkins usermod -aG docker jenkins
```

**접속:**
```bash
# 로컬 PC에서
ssh -L 8080:localhost:8080 john@221.158.18.47

# 브라우저
http://localhost:8080
```

#### 방법 3: 특정 IP만 허용
```bash
ssh john@221.158.18.47

# 현재 IP 확인
curl ifconfig.me
# 예: 123.456.789.012

# iptables 설정
sudo apt install -y iptables iptables-persistent
sudo iptables -I INPUT -p tcp --dport 8080 -s 123.456.789.012 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 8080 -j DROP
sudo netfilter-persistent save
```

---

## 📋 초기 설정 (2분)

### 1. Jenkins 웹 접속

```bash
# 초기 비밀번호 확인
ssh john@221.158.18.47 "docker logs jenkins 2>&1 | grep -A 2 'Please use the following password'"
```

초기 비밀번호: `81687fcc1ea34d2195849d39e3663f20`

### 2. 플러그인 설치

1. 브라우저에서 Jenkins 접속
2. 초기 비밀번호 입력
3. **"Install suggested plugins"** 클릭
4. 5분 대기 (자동 설치)

### 3. Admin 계정 생성

```
Username: admin
Password: (강력한 비밀번호 - 최소 16자)
Full name: Rollbook Admin
E-mail: admin@rollbook.local
```

### 4. 🔐 즉시 보안 설정!

**Manage Jenkins** → **Configure Global Security**
- ⚠️ **Allow users to sign up 체크 해제** (매우 중요!)
- **Save**

---

## 🚀 첫 파이프라인 생성

### 1. New Item
- Name: `rollbook-pipeline`
- Type: **Pipeline**
- **OK**

### 2. 설정

**Build Triggers:**
- ☑ Poll SCM
- Schedule: `H/5 * * * *` (5분마다 Git 확인)

**Pipeline:**
- Definition: `Pipeline script from SCM`
- SCM: `Git`
- Repository URL: `/home/john/rollbook/.git` (로컬 경로)
- Branch: `*/main`
- Script Path: `Jenkinsfile`

**Save**

### 3. 첫 빌드!

**Build Now** 클릭 → **Console Output** 확인

---

## ✅ 완료 체크리스트

- [ ] 보안 설정 완료 (방화벽 or localhost)
- [ ] Jenkins 초기 설정 완료
- [ ] "Allow users to sign up" 해제
- [ ] 강력한 비밀번호 설정
- [ ] 첫 파이프라인 생성
- [ ] 빌드 테스트 성공

---

## 🎯 다음 단계

### GitHub 연동 (선택)

자세한 내용: `JENKINS_SETUP.md` 참고

### 자동 배포 테스트

```bash
# 코드 수정 후
git add .
git commit -m "Test Jenkins auto build"
git push origin main

# Jenkins에서 5분 내 자동 빌드 시작!
```

---

## 🆘 문제 해결

### Jenkins 접속 불가
```bash
# 컨테이너 상태 확인
ssh john@221.158.18.47 "docker ps | grep jenkins"

# 로그 확인
ssh john@221.158.18.47 "docker logs jenkins"

# 재시작
ssh john@221.158.18.47 "docker restart jenkins"
```

### 빌드 실패
```bash
# Docker 권한 확인
ssh john@221.158.18.47 "docker exec jenkins docker ps"

# 권한 없으면
ssh john@221.158.18.47 "docker exec -u root jenkins usermod -aG docker jenkins && docker restart jenkins"
```

### 초기 비밀번호 분실
```bash
ssh john@221.158.18.47 "docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword"
```

---

## 📚 추가 자료

- **상세 가이드**: `JENKINS_SETUP.md`
- **보안 강화**: `JENKINS_SETUP.md` → 보안 섹션
- **파이프라인**: `Jenkinsfile`

---

## ⚠️ 최종 보안 체크

접속 전에 반드시 확인:

```bash
# 외부에서 접근 가능한지 확인
curl -I http://221.158.18.47:8080

# 접근 불가능해야 정상 (localhost 설정 시)
# curl: (7) Failed to connect to 221.158.18.47 port 8080

# 또는 특정 IP만 허용되어야 함
```

**보안 설정 없이 사용하면 해킹 위험 100%!**
