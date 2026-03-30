# 로컬 개발 가이드

이 문서는 로컬 환경에서 앱을 직접 실행하고, 필요한 의존성은 Docker 또는 Docker Compose로 띄우는 개발 방식을 설명합니다.

## 기본 원칙

- 앱 자체는 로컬에서 직접 실행 가능해야 합니다.
- Redis, DB, ZooKeeper 같은 의존성은 Docker / Docker Compose로 쉽게 띄울 수 있어야 합니다.
- 모든 것을 무조건 Docker에 넣기보다 개발 생산성을 우선합니다.

## 권장 로컬 개발 방식

### 앱은 직접 실행

예시:

```bash
nest start {appName} --watch
```

### 의존성은 Docker Compose로 실행

예시:

```bash
docker compose -f docker/compose/docker-compose.redis.yml up -d
docker compose -f docker/compose/docker-compose.mysql.yml up -d
```

## 왜 이렇게 하는가

### 장점

- 앱 디버깅이 쉽습니다.
- 코드 변경 반영이 빠릅니다.
- 인프라는 재현 가능한 방식으로 띄울 수 있습니다.
- 개발자 PC에 DB/Redis를 직접 설치할 필요가 줄어듭니다.

### 주의할 점

앱이 호스트에서 실행되는지, 컨테이너 안에서 실행되는지에 따라 host 값이 달라질 수 있습니다.

예를 들면:

- 앱을 호스트에서 실행하면 DB host는 `localhost`
- 앱도 컨테이너에서 실행하면 DB host는 compose 서비스명

## 기본 포트 예시

### Redis

- host: localhost
- port: 6379

### MySQL

- host: localhost
- port: 3306

### PostgreSQL

- host: localhost
- port: 5432

### MSSQL

- host: localhost
- port: 1433

### ZooKeeper

- host: localhost
- port: 2181

## 실행 예시

### Redis만 필요한 경우

```bash
docker compose -f docker/compose/docker-compose.redis.yml up -d
nest start {appName} --watch
```

### MySQL + Redis가 필요한 경우

```bash
docker compose -f docker/compose/docker-compose.mysql.yml up -d
docker compose -f docker/compose/docker-compose.redis.yml up -d
nest start {appName} --watch
```

### 전체 의존성이 필요한 경우

```bash
docker compose -f docker/compose/docker-compose.local-full.yml up -d
nest start {appName} --watch
```

## 설정 파일 가이드

설정 파일은 보통 아래 위치에 둡니다.

```text
apps/{appName}/config/local/
  app.yml
  server.yml
  database.yml
  redis.yml
```

예시 용도:

- `app.yml`: 서비스명, 환경명 등 공통 설정
- `server.yml`: 포트, 서버 옵션
- `database.yml`: DB 종류, host, port, username, password, database
- `redis.yml`: host, port, db index, password

## 문제 발생 시 확인할 것

### 앱 부팅 실패

- local config가 빠졌는지
- 포트 충돌이 있는지
- 필요한 모듈이 AppModule에 등록됐는지

### DB 연결 실패

- Docker Compose가 정상 기동됐는지
- host/port가 local config와 맞는지
- username/password/database 이름이 맞는지

### Redis 연결 실패

- Redis 컨테이너가 실행 중인지
- 포트가 맞는지
- 인증 정보가 맞는지

### Health check 실패

- readiness 대상 의존성이 실제 연결 가능한지
- 헬스체크 설정이 잘못되지 않았는지

## 권장 개발 흐름

1. 필요한 의존성만 Compose로 실행
2. 앱은 로컬에서 직접 실행
3. 로그로 부팅 상태 확인
4. readiness/liveness 확인
5. 테스트 실행
6. 작업 종료 후 필요 없는 컨테이너 정리

## 컨테이너 정리

```bash
docker compose -f docker/compose/docker-compose.local-full.yml down
```

또는 파일별 종료:

```bash
docker compose -f docker/compose/docker-compose.redis.yml down
```
