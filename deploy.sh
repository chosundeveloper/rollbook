#!/bin/bash
# 무중단 배포 스크립트
# 빌드가 완료될 때까지 기존 컨테이너 유지

set -e

echo "=== 1. 이미지 빌드 (기존 컨테이너 유지) ==="
docker-compose build

echo "=== 2. 새 컨테이너로 교체 ==="
docker-compose up -d --no-build --force-recreate

echo "=== 3. 배포 확인 대기 ==="
sleep 5

if docker exec rollbook wget -q --spider http://127.0.0.1:3000/login; then
  echo "=== 배포 완료! ==="
else
  echo "=== 경고: 헬스체크 실패 ==="
fi
