# 🤖 GitHub Actions 자동 배포 설정

## 📋 개요

GitHub Actions를 사용하면 `main` 브랜치에 푸시할 때마다 자동으로 서버(`172.30.1.46`)에 배포됩니다.

## 🔑 1단계: SSH 키 생성 및 설정

### 로컬에서 SSH 키 생성 (아직 없다면)

```bash
# SSH 키 생성
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# 공개키를 서버에 복사
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub john@172.30.1.46

# 연결 테스트
ssh -i ~/.ssh/github_actions_deploy john@172.30.1.46 "echo 'SSH connection successful!'"
```

### 개인키 내용 복사

```bash
cat ~/.ssh/github_actions_deploy
```

출력된 내용 전체를 복사하세요 (-----BEGIN부터 -----END까지)

## 🔒 2단계: GitHub Secrets 설정

GitHub 저장소 → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

다음 Secrets을 추가하세요:

| Secret Name | Value | 설명 |
|-------------|-------|------|
| `SSH_PRIVATE_KEY` | (위에서 복사한 개인키 전체) | GitHub Actions가 서버 접속에 사용 |
| `SERVER_HOST` | `172.30.1.46` | 배포 서버 IP |
| `SERVER_USER` | `john` | SSH 사용자명 |
| `SERVER_PATH` | `/srv/projects/rollbook` | 서버에서 프로젝트 경로 |
| `ROLLBOOK_SESSION_SECRET` | (랜덤 문자열) | 세션 암호화 키 |

### ROLLBOOK_SESSION_SECRET 생성하기

```bash
# 랜덤 문자열 생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🚀 3단계: 배포 워크플로우 확인

생성된 워크플로우:

1. **`.github/workflows/deploy.yml`** - 자동 배포
   - `main` 브랜치에 푸시하면 자동 실행
   - 코드 전송 → Docker 빌드 → 컨테이너 재시작

2. **`.github/workflows/manual-deploy.yml`** - 수동 배포
   - GitHub Actions 탭에서 수동으로 실행 가능
   - 환경 선택, 강제 리빌드 옵션

## 📦 4단계: 첫 배포

```bash
# 변경사항 커밋 및 푸시
git add .
git commit -m "Add GitHub Actions deployment"
git push origin main
```

GitHub Actions 탭에서 배포 진행 상황 확인:
- https://github.com/YOUR_USERNAME/rollbook/actions

## 🎯 배포 플로우

```
로컬에서 코드 수정
    ↓
git push origin main
    ↓
GitHub Actions 자동 실행
    ↓
1. 코드 체크아웃
2. SSH 연결 설정
3. rsync로 파일 전송
4. .env 파일 생성
5. Docker 빌드 & 배포
    ↓
서버에 자동 배포 완료! 🎉
```

## 🔧 배포 관리

### 수동 배포 실행

GitHub → **Actions** → **Manual Deploy with Options** → **Run workflow**

옵션:
- **environment**: production / staging
- **rebuild**: 강제 리빌드 여부

### 배포 로그 확인

GitHub Actions 탭에서 워크플로우 클릭 → 각 단계별 로그 확인

### 배포 실패 시

1. GitHub Actions 로그 확인
2. SSH 연결 문제: Secrets 확인
3. Docker 빌드 실패: 서버 접속해서 로그 확인
   ```bash
   ssh john@172.30.1.46
   cd /srv/projects/rollbook
   docker-compose logs
   ```

## 🔄 워크플로우 비교

### 자동 배포 (deploy.yml)
- **트리거**: `main` 브랜치 푸시
- **용도**: 일반적인 개발 → 배포 플로우
- **특징**: 완전 자동, 개입 불필요

### 수동 배포 (manual-deploy.yml)
- **트리거**: GitHub UI에서 수동 실행
- **용도**: 긴급 배포, 테스트, 롤백
- **특징**: 환경 선택, 옵션 지정 가능

## 🎛️ 고급 설정

### 특정 브랜치만 배포

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches:
      - main
      - production  # 추가 브랜치
```

### 특정 파일 변경시만 배포

```yaml
on:
  push:
    branches:
      - main
    paths:
      - 'src/**'
      - 'public/**'
      - 'package.json'
      - 'Dockerfile'
```

### 배포 전 테스트 실행

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test  # 테스트 추가

  deploy:
    needs: test  # 테스트 성공 후 배포
    runs-on: ubuntu-latest
    # ... (배포 단계)
```

### 슬랙/디스코드 알림

```yaml
- name: Notify deployment
  if: success()
  run: |
    curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"🚀 Rollbook deployed successfully!"}' \
    ${{ secrets.SLACK_WEBHOOK_URL }}
```

## 🐛 트러블슈팅

### Permission denied (publickey)
- `SSH_PRIVATE_KEY` Secret이 올바른지 확인
- 서버에 공개키가 추가되었는지 확인: `cat ~/.ssh/authorized_keys`

### rsync: command not found
- 서버에 rsync 설치: `sudo apt install rsync`

### Docker command not found
- 서버에서 `deployment/server-setup.sh` 실행했는지 확인

### Container won't start
- GitHub Actions 로그에서 `docker-compose logs` 확인
- 서버 직접 접속: `ssh john@172.30.1.46 'cd /srv/projects/rollbook && docker-compose logs'`

## 📚 참고

- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [SSH Agent Action](https://github.com/webfactory/ssh-agent)
- [Docker Compose 문서](https://docs.docker.com/compose/)
