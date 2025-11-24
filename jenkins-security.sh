#!/bin/bash
# Jenkins 보안 강화 스크립트
# 사용법: ssh john@221.158.18.47 < jenkins-security.sh

set -e

echo "🔐 Jenkins 보안 강화 스크립트"
echo "================================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 현재 IP 확인
MY_IP=$(curl -s ifconfig.me)
echo -e "${GREEN}현재 접속 IP: $MY_IP${NC}"

# 메뉴 선택
echo ""
echo "보안 옵션을 선택하세요:"
echo "1) localhost만 허용 (가장 안전, SSH 터널 필요)"
echo "2) 특정 IP만 허용 (현재 IP: $MY_IP)"
echo "3) 내부 네트워크만 허용 (172.30.1.0/24)"
echo "4) 방화벽 설정 건너뛰기 (권장하지 않음)"
read -p "선택 (1-4): " choice

case $choice in
  1)
    echo -e "${YELLOW}Jenkins를 localhost만 접근 가능하도록 재설정...${NC}"
    docker rm -f jenkins
    docker run -d \
      --name jenkins \
      --restart=unless-stopped \
      -p 127.0.0.1:8080:8080 \
      -p 50000:50000 \
      -v jenkins_home:/var/jenkins_home \
      -v /var/run/docker.sock:/var/run/docker.sock \
      jenkins/jenkins:lts

    echo -e "${GREEN}✅ 완료!${NC}"
    echo ""
    echo "이제 SSH 터널로 접속하세요:"
    echo "  ssh -L 8080:localhost:8080 john@221.158.18.47"
    echo "  브라우저: http://localhost:8080"
    ;;

  2)
    echo -e "${YELLOW}특정 IP만 허용 설정 중...${NC}"

    # iptables 설치 확인
    if ! command -v iptables &> /dev/null; then
      echo "iptables 설치 중..."
      sudo apt-get update && sudo apt-get install -y iptables iptables-persistent
    fi

    # 기존 규칙 확인
    echo "현재 방화벽 규칙:"
    sudo iptables -L INPUT -n --line-numbers | grep 8080

    # 새 규칙 추가
    sudo iptables -I INPUT -p tcp --dport 8080 -s $MY_IP -j ACCEPT
    sudo iptables -A INPUT -p tcp --dport 8080 -j DROP

    # 규칙 저장
    sudo netfilter-persistent save

    echo -e "${GREEN}✅ $MY_IP 만 Jenkins 접근 가능${NC}"
    ;;

  3)
    echo -e "${YELLOW}내부 네트워크만 허용 설정 중...${NC}"

    if ! command -v iptables &> /dev/null; then
      sudo apt-get update && sudo apt-get install -y iptables iptables-persistent
    fi

    sudo iptables -I INPUT -p tcp --dport 8080 -s 172.30.1.0/24 -j ACCEPT
    sudo iptables -A INPUT -p tcp --dport 8080 -j DROP
    sudo netfilter-persistent save

    echo -e "${GREEN}✅ 172.30.1.0/24 네트워크만 Jenkins 접근 가능${NC}"
    ;;

  4)
    echo -e "${RED}⚠️  경고: 방화벽 설정을 건너뜁니다!${NC}"
    echo -e "${RED}Jenkins가 인터넷에 노출되어 있습니다!${NC}"
    ;;

  *)
    echo -e "${RED}잘못된 선택입니다.${NC}"
    exit 1
    ;;
esac

# Jenkins 재시작 (옵션 1이 아닌 경우)
if [ "$choice" != "1" ]; then
  echo ""
  echo "Jenkins 컨테이너 재시작..."
  docker restart jenkins 2>/dev/null || true
fi

# Docker 권한 설정
echo ""
echo "Jenkins Docker 권한 설정..."
docker exec -u root jenkins usermod -aG docker jenkins 2>/dev/null || true

# 초기 비밀번호 표시
echo ""
echo "================================"
echo -e "${GREEN}🎉 보안 설정 완료!${NC}"
echo ""
echo "Jenkins 초기 비밀번호:"
docker logs jenkins 2>&1 | grep -A 2 "Please use the following password" | tail -n 1

echo ""
echo "다음 단계:"
echo "1. 브라우저에서 Jenkins 접속"
if [ "$choice" == "1" ]; then
  echo "   - SSH 터널: ssh -L 8080:localhost:8080 john@221.158.18.47"
  echo "   - URL: http://localhost:8080"
else
  echo "   - URL: http://221.158.18.47:8080"
fi
echo "2. 초기 설정 완료"
echo "3. Manage Jenkins → Configure Global Security"
echo "   - Allow users to sign up 체크 해제!"
echo ""
echo "보안 가이드: JENKINS_SETUP.md 참고"
