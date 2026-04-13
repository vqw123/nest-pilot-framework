# nest-pilot local dev environment startup (Windows PowerShell)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "============================================"
Write-Host " nest-pilot local dev environment starting"
Write-Host "============================================"

Write-Host ""
Write-Host "[1/3] Building and starting Docker containers..."
docker compose -f "$ScriptDir\docker-compose.yml" up -d --build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to start Docker containers." -ForegroundColor Red
    exit 1
}

# IMPORTANT: Change these passwords in production
$mysqlUser = "root"
$mysqlPassword = "1234"
$mysqlMaster = "mysql-master"
$mysqlSlave = "mysql-slave"
$replUser = "replica"
$replPwd = "1234"

Write-Host ""
Write-Host "[2/3] Waiting for MySQL to initialize... (up to 60s)"

$maxWait = 60
$waited = 0
$ready = $false

while ($waited -lt $maxWait) {
    Start-Sleep -Seconds 3
    $waited += 3
    $result = docker exec $mysqlMaster mysqladmin --user="$mysqlUser" --password="$mysqlPassword" ping 2>&1
    if ($result -match "mysqld is alive") {
        $ready = $true
        break
    }
    Write-Host "  Waiting... ($waited / $maxWait s)"
}

if (-not $ready) {
    Write-Host "ERROR: MySQL Master did not become ready in time." -ForegroundColor Red
    exit 1
}

Write-Host "  MySQL Master is ready!"

Write-Host ""
Write-Host "[3/3] Configuring MySQL Replication..."

$masterIp = docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $mysqlMaster

Write-Host "master> CREATE USER '$replUser'@'%'"
docker exec $mysqlMaster mysql --user="$mysqlUser" --password="$mysqlPassword" -e "CREATE USER '${replUser}'@'%' IDENTIFIED BY '${replPwd}';" 2>&1 | Where-Object { $_ -notmatch "Warning" }

Write-Host "master> GRANT REPLICATION"
docker exec $mysqlMaster mysql --user="$mysqlUser" --password="$mysqlPassword" -e "GRANT REPLICATION SLAVE,REPLICATION CLIENT ON *.* TO '${replUser}'@'%';" 2>&1 | Where-Object { $_ -notmatch "Warning" }

Write-Host "master> FLUSH PRIVILEGES"
docker exec $mysqlMaster mysql --user="$mysqlUser" --password="$mysqlPassword" -e "FLUSH PRIVILEGES;" 2>&1 | Where-Object { $_ -notmatch "Warning" }

Write-Host "master> RESET MASTER"
docker exec $mysqlMaster mysql --user="$mysqlUser" --password="$mysqlPassword" -e "RESET MASTER;" 2>&1 | Where-Object { $_ -notmatch "Warning" }

Write-Host "slave> STOP REPLICA"
docker exec $mysqlSlave mysql --user="$mysqlUser" --password="$mysqlPassword" -e "STOP REPLICA;" 2>&1 | Where-Object { $_ -notmatch "Warning" }

Write-Host "slave> RESET REPLICA"
docker exec $mysqlSlave mysql --user="$mysqlUser" --password="$mysqlPassword" -e "RESET REPLICA;" 2>&1 | Where-Object { $_ -notmatch "Warning" }

Write-Host "slave> CHANGE REPLICATION SOURCE"
docker exec $mysqlSlave mysql --user="$mysqlUser" --password="$mysqlPassword" -e "CHANGE REPLICATION SOURCE TO SOURCE_HOST='${masterIp}', SOURCE_USER='${replUser}', SOURCE_PASSWORD='${replPwd}', SOURCE_AUTO_POSITION=1, GET_SOURCE_PUBLIC_KEY=1;" 2>&1 | Where-Object { $_ -notmatch "Warning" }

Write-Host "slave> START REPLICA"
docker exec $mysqlSlave mysql --user="$mysqlUser" --password="$mysqlPassword" -e "START REPLICA;" 2>&1 | Where-Object { $_ -notmatch "Warning" }

Write-Host "slave> SET GLOBAL super_read_only"
docker exec $mysqlSlave mysql --user="$mysqlUser" --password="$mysqlPassword" -e "SET GLOBAL super_read_only = 1" 2>&1 | Where-Object { $_ -notmatch "Warning" }

Write-Host ""
Write-Host "============================================"
Write-Host " Done! Local dev environment is ready."
Write-Host ""
Write-Host " MySQL  Master : localhost:3306"
Write-Host " MySQL  Slave  : localhost:3307"
Write-Host " Redis  Master : localhost:6379"
Write-Host " Redis  Slave  : localhost:6380"
Write-Host "============================================"
