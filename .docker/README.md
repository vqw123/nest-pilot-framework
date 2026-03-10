# 로컬 개발 환경

MySQL (Master/Slave), Redis (Master/Slave) 컨테이너를 로컬에서 실행합니다.

## 사전 요구사항

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 설치 필요

## 실행

### Mac / Linux

```bash
.docker/start.sh
```

### Windows (PowerShell)

```powershell
.docker\start.ps1
```

> **Windows 최초 실행 시**: PowerShell 스크립트 실행 권한이 필요합니다.
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

빌드 → 컨테이너 실행 → MySQL Replication 설정까지 자동으로 처리됩니다.
종료는 Docker Desktop에서 컨테이너를 직접 중지하세요.

## 접속 정보

| 서비스 | Host | Port | 비고 |
|---|---|---|---|
| MySQL Master | localhost | 3306 | 읽기/쓰기 |
| MySQL Slave | localhost | 3307 | 읽기 전용 |
| Redis Master | localhost | 6379 | 읽기/쓰기 |
| Redis Slave | localhost | 6380 | 읽기 전용 |

**MySQL 계정**

| 항목 | 값 |
|---|---|
| User | `root` |
| Password | `1234` |
| Database | `nest_example` |

> 운영 환경 전환 시 `docker-compose.yml`과 `set-replica.sh`의 비밀번호를 반드시 변경하세요.

## 구조

```
.docker/
├── docker-compose.yml       # 전체 컨테이너 정의
├── start.sh                 # 시작 스크립트 (Mac/Linux)
├── start.ps1                # 시작 스크립트 (Windows)
├── set-replica.sh           # MySQL Replication 수동 설정
├── mysql/
│   ├── master/              # MySQL Master 설정 (server_id=1, GTID)
│   ├── slave/               # MySQL Slave 설정 (server_id=2, read_only)
│   └── init/
│       └── init.sql         # 초기 데이터베이스 생성 (nest_example)
└── redis/
    ├── master/              # Redis Master 설정
    └── slave/               # Redis Slave 설정 (replicaof master)
```

## MySQL Replication 수동 재설정

`start.sh` / `start.ps1` 실행 시 자동으로 처리됩니다.
재설정이 필요한 경우에만 직접 실행하세요.

```bash
.docker/set-replica.sh
```

## 데이터 초기화

컨테이너와 볼륨을 모두 삭제하고 초기화합니다.

```bash
docker compose -f .docker/docker-compose.yml down -v
```
