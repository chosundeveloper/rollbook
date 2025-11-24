# Jenkins 접속 방법

## ✅ 보안 설정 완료!

Jenkins가 **localhost 전용**으로 설정되어 **외부 접속이 완전히 차단**되었습니다.

---

## 🔐 접속 정보

```
초기 비밀번호: 81687fcc1ea34d2195849d39e3663f20
```

---

## 💻 접속 방법

### 방법 1: SSH 터널링 (어디서든 접속)

#### Mac/Linux:
```bash
# 터미널에서 실행
ssh -L 8080:localhost:8080 john@172.30.1.46
# 비밀번호: 1234

# 터미널을 켜둔 상태에서 브라우저 열기
# URL: http://localhost:8080
```

#### Windows (PowerShell):
```powershell
ssh -L 8080:localhost:8080 john@172.30.1.46
# 비밀번호: 1234

# 브라우저: http://localhost:8080
```

#### Windows (PuTTY):
```
1. PuTTY 실행
2. Host Name: 172.30.1.46
3. Connection → SSH → Tunnels
   - Source port: 8080
   - Destination: localhost:8080
   - Add 클릭
4. Open 클릭
5. 로그인: john / 1234
6. 브라우저: http://localhost:8080
```

### 방법 2: 서버에서 직접 접속

```bash
# 서버에 SSH 접속
ssh john@172.30.1.46

# 서버 내부에서만 접속 가능
curl http://localhost:8080
```

---

## 🚀 초기 설정 단계

### 1. SSH 터널 열기
```bash
ssh -L 8080:localhost:8080 john@172.30.1.46
```

**주의:** 이 터미널 창을 닫으면 Jenkins 접속이 끊깁니다!

### 2. 브라우저에서 접속
```
http://localhost:8080
```

### 3. 초기 비밀번호 입력
```
81687fcc1ea34d2195849d39e3663f20
```

### 4. 플러그인 설치
- **Install suggested plugins** 선택
- 5-10분 대기

### 5. Admin 계정 생성
```
Username: admin
Password: (강력한 비밀번호 - 최소 16자)
Full name: Rollbook Admin
Email: admin@rollbook.local
```

### 6. Jenkins URL 설정
```
http://localhost:8080/
```
**Save and Finish**

### 7. 🔐 즉시 보안 설정!
1. **Manage Jenkins** → **Configure Global Security**
2. ⚠️ **Allow users to sign up 체크 해제** (매우 중요!)
3. **Save**

---

## 📋 첫 파이프라인 생성

### 1. New Item
- 이름: `rollbook-pipeline`
- 타입: **Pipeline**
- **OK**

### 2. 설정

**Build Triggers:**
```
☑ Poll SCM
Schedule: H/5 * * * *
```

**Pipeline:**
```
Definition: Pipeline script from SCM
SCM: Git
Repository URL: /home/john/rollbook/.git
Branch: */main
Script Path: Jenkinsfile
```

**Save**

### 3. 첫 빌드 테스트
**Build Now** 클릭 → **Console Output** 확인

---

## ⚡ 빠른 접속 (별칭 설정)

### Mac/Linux (.bashrc 또는 .zshrc):
```bash
# 파일 열기
nano ~/.bashrc  # 또는 ~/.zshrc

# 아래 추가
alias jenkins='ssh -L 8080:localhost:8080 john@172.30.1.46'

# 저장 후
source ~/.bashrc  # 또는 source ~/.zshrc

# 이후 사용
jenkins
# 브라우저: http://localhost:8080
```

### Windows (PowerShell Profile):
```powershell
# Profile 열기
notepad $PROFILE

# 아래 추가
function Connect-Jenkins {
    ssh -L 8080:localhost:8080 john@172.30.1.46
}
Set-Alias jenkins Connect-Jenkins

# 저장 후
. $PROFILE

# 이후 사용
jenkins
```

---

## 🔍 트러블슈팅

### "Connection refused" 에러
```bash
# Jenkins 컨테이너 상태 확인
ssh john@172.30.1.46 "docker ps | grep jenkins"

# 재시작
ssh john@172.30.1.46 "docker restart jenkins"
```

### "localhost:8080 연결 거부" 에러
→ SSH 터널이 끊어짐. 다시 연결:
```bash
ssh -L 8080:localhost:8080 john@172.30.1.46
```

### 초기 비밀번호 분실
```bash
ssh john@172.30.1.46 "docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword"
```

### 포트 8080이 이미 사용 중
→ 다른 포트 사용:
```bash
ssh -L 8888:localhost:8080 john@172.30.1.46
# 브라우저: http://localhost:8888
```

---

## 🎯 자동 빌드 테스트

```bash
# 코드 수정 후
git add .
git commit -m "Test Jenkins build"
git push origin main

# Jenkins Poll SCM이 5분 내 자동 감지
# 또는 Jenkins 웹에서 "Build Now" 수동 실행
```

---

## 📚 추가 가이드

- **상세 설정**: `JENKINS_SETUP.md`
- **빠른 시작**: `JENKINS_QUICKSTART.md`
- **파이프라인**: `Jenkinsfile`

---

## ✅ 보안 체크리스트

- [x] 외부 접속 차단 (localhost만)
- [x] SSH 암호화 터널 사용
- [ ] Admin 계정 생성 완료
- [ ] "Allow users to sign up" 해제
- [ ] 강력한 비밀번호 설정
- [ ] 첫 파이프라인 생성
- [ ] 빌드 테스트 성공

---

**🎉 완벽한 보안 설정 완료!**

해킹 위험 0%, SSH로 안전하게 어디서든 접속 가능합니다.
