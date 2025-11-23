# ⚡ 5분 배포 퀵스타트

## 🎯 목표
`git push` → 자동 배포

## 📝 체크리스트

### ✅ 1. SSH 키 생성 & 등록 (2분)
```bash
ssh-keygen -t ed25519 -f ~/.ssh/rollbook_deploy -N ""
ssh-copy-id -i ~/.ssh/rollbook_deploy.pub john@172.30.1.46
```

### ✅ 2. GitHub Secrets 추가 (2분)
GitHub → Settings → Secrets → Actions → New secret

| Secret 이름 | 값 | 얻는 방법 |
|-------------|-----|----------|
| SSH_PRIVATE_KEY | (개인키) | `cat ~/.ssh/rollbook_deploy` |
| SERVER_HOST | 172.30.1.46 | 그대로 입력 |
| SERVER_USER | john | 그대로 입력 |
| SERVER_PATH | /srv/projects/rollbook | 그대로 입력 |
| ROLLBOOK_SESSION_SECRET | (랜덤) | `openssl rand -hex 32` |

### ✅ 3. 서버 준비 (1분)
```bash
ssh john@172.30.1.46
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
exit
ssh john@172.30.1.46
docker network create traefik-network
sudo mkdir -p /srv/projects /srv/traefik
sudo chown -R $USER:$USER /srv
exit
```

### ✅ 4. Traefik 설치 (1분)
```bash
cd deployment
chmod +x setup-traefik.sh
./setup-traefik.sh
```

### ✅ 5. 배포!
```bash
git push origin main
```

GitHub Actions 탭에서 배포 확인!

---

## 🚀 완료!

이제부터:
1. 코드 수정
2. `git push`
3. 자동 배포 ✨

접속: `http://172.30.1.46`

---

## 🆘 문제 발생?

**SSH 연결 안 됨:**
```bash
ssh -i ~/.ssh/rollbook_deploy john@172.30.1.46
```

**배포 실패:**
- GitHub Actions 탭에서 로그 확인

**상세 가이드:**
- `deployment/GITHUB_ACTIONS_SETUP.md`
- `deployment/EASIEST_DEPLOY.md`
