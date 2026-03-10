# nest-pilot 로컬 개발 환경 시작 (Windows PowerShell)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "============================================"
Write-Host " nest-pilot 로컬 개발 환경 시작"
Write-Host "============================================"

Write-Host ""
Write-Host "[1/3] Docker 컨테이너 빌드 및 실행 중..."
docker compose -f "$ScriptDir\docker-compose.yml" up -d --build

if ($LASTEXITCODE -ne 0) {
    Write-Host "오류: Docker 컨테이너 실행에 실패했습니다." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[2/3] MySQL 초기화 대기 중... (10초)"
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "[3/3] MySQL Replication 설정 중..."

# 운영 환경에서는 반드시 아래 비밀번호를 변경하세요
$user = "root"
$password = "1234"
$mysqlMaster = "mysql-master"
$mysqlSlave = "mysql-slave"
$replUser = "replica"
$replPwd = "1234"

$masterIp = docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $mysqlMaster

Write-Host "master> CREATE USER '$replUser'@'%'"
docker exec $mysqlMaster mysql -u$user -p$password -e "CREATE USER '${replUser}'@'%' IDENTIFIED BY '${replPwd}';" 2>&1 | Where-Object { $_ -notmatch "Warning" }

Write-Host "master> GRANT REPLICATION"
docker exec $mysqlMaster mysql -u$user -p$password -e "GRANT REPLICATION SLAVE,REPLICATION CLIENT ON *.* TO '${replUser}'@'%';" 2>&1 | Where-Object { $_ -notmatch "Warning" }

Write-Host "master> FLUSH PRIVILEGES"
docker exec $mysqlMaster mysql -u$user -p$password -e "FLUSH PRIVILEGES;" 2>&1 | Where-Object { $_ -notmatch "Warning" }

Write-Host "master> RESET BINARY LOGS AND GTIDS"
docker exec $mysqlMaster mysql -u$user -p$password -e "RESET BINARY LOGS AND GTIDS;" 2>&1 | Where-Object { $_ -notmatch "Warning" }

Write-Host "slave> STOP REPLICA"
docker exec $mysqlSlave mysql -u$user -p$password -e "STOP REPLICA;" 2>&1 | Where-Object { $_ -notmatch "Warning" }

Write-Host "slave> RESET REPLICA"
docker exec $mysqlSlave mysql -u$user -p$password -e "RESET REPLICA;" 2>&1 | Where-Object { $_ -notmatch "Warning" }

Write-Host "slave> CHANGE REPLICATION SOURCE"
docker exec $mysqlSlave mysql -u$user -p$password -e "CHANGE REPLICATION SOURCE TO SOURCE_HOST='${masterIp}', SOURCE_USER='${replUser}', SOURCE_PASSWORD='${replPwd}', SOURCE_AUTO_POSITION=1, GET_SOURCE_PUBLIC_KEY=1;" 2>&1 | Where-Object { $_ -notmatch "Warning" }

Write-Host "slave> START REPLICA"
docker exec $mysqlSlave mysql -u$user -p$password -e "START REPLICA;" 2>&1 | Where-Object { $_ -notmatch "Warning" }

Write-Host "slave> SET GLOBAL super_read_only"
docker exec $mysqlSlave mysql -u$user -p$password -e "SET GLOBAL super_read_only = 1" 2>&1 | Where-Object { $_ -notmatch "Warning" }

Write-Host ""
Write-Host "============================================"
Write-Host " 완료! 로컬 개발 환경이 준비되었습니다."
Write-Host ""
Write-Host " MySQL  Master : localhost:3306"
Write-Host " MySQL  Slave  : localhost:3307"
Write-Host " Redis  Master : localhost:6379"
Write-Host " Redis  Slave  : localhost:6380"
Write-Host "============================================"
