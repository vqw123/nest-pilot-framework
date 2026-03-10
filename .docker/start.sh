#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "============================================"
echo " nest-pilot 로컬 개발 환경 시작"
echo "============================================"

echo ""
echo "[1/3] Docker 컨테이너 빌드 및 실행 중..."
docker compose -f "${SCRIPT_DIR}/docker-compose.yml" up -d --build

if [ $? -ne 0 ]; then
  echo "오류: Docker 컨테이너 실행에 실패했습니다."
  exit 1
fi

echo ""
echo "[2/3] MySQL 초기화 대기 중... (10초)"
sleep 10

echo ""
echo "[3/3] MySQL Replication 설정 중..."
bash "${SCRIPT_DIR}/set-replica.sh"

if [ $? -ne 0 ]; then
  echo "오류: MySQL Replication 설정에 실패했습니다."
  exit 1
fi

echo ""
echo "============================================"
echo " 완료! 로컬 개발 환경이 준비되었습니다."
echo ""
echo " MySQL  Master : localhost:3306"
echo " MySQL  Slave  : localhost:3307"
echo " Redis  Master : localhost:6379"
echo " Redis  Slave  : localhost:6380"
echo "============================================"
