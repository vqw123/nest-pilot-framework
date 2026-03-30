# 새 프로젝트 시작 가이드

이 문서는 `nest-pilot-framework`를 복사하거나 템플릿처럼 사용해서 새로운 백엔드 프로젝트를 시작하는 절차를 설명합니다.

## 1. 스타터 복사

```bash
cp -R nest-pilot-framework my-new-backend
cd my-new-backend
```

또는 이 저장소를 템플릿 저장소처럼 사용할 수도 있습니다.

## 2. 의존성 설치

```bash
npm install
```

## 3. Claude 템플릿 복사

Claude용 프로젝트 지침과 skill을 프로젝트 루트에 복사합니다.

```bash
cp templates/claude/CLAUDE.md ./CLAUDE.md
cp -R templates/claude/.claude ./.claude
```

## 4. 대상 앱 생성 또는 정리

새 앱을 만들 경우:

```bash
nest generate app my-service
```

기존 앱을 재사용할 경우:

- 사용하지 않는 example/auth 코드를 정리합니다.
- `apps/{appName}/config` 구조를 점검합니다.
- 필요한 공용 모듈 등록 여부를 확인합니다.

## 5. 설정 파일 준비

설정 파일은 보통 아래 위치에 둡니다.

- `apps/{appName}/config/local`
- `apps/{appName}/config/development`
- `apps/{appName}/config/production`

일반적으로 필요한 설정 영역:

- application
- server
- database
- redis
- logger
- health
- swagger
- external integrations

## 6. 로컬 의존성 실행

```bash
sh .docker/start.sh
```

직접 실행하려면:

```bash
docker compose -f .docker/docker-compose.yml up -d
```

## 7. 대상 앱 실행

```bash
nest start {appName} --watch
```

또는 package script가 맞춰져 있다면:

```bash
npm run start auth
```

## 8. 정상 동작 확인

아래를 확인합니다.

- 애플리케이션 부팅 로그
- 설정 파일 로딩
- DB 연결
- Redis 연결
- health endpoint
- swagger endpoint 사용 여부

## 9. 테스트 추가

최소한 아래는 권장합니다.

- 비즈니스 로직 unit test
- 주요 흐름 integration 또는 e2e test
- 필요 시 config/runtime sanity check

## 10. 먼저 읽을 문서

기능 개발 전에 아래 문서를 먼저 확인하는 것을 권장합니다.

- `docs/starter-guide/ARCHITECTURE_PRINCIPLES.md`
- `docs/starter-guide/NEW_APP_CHECKLIST.md`
- `docs/starter-guide/LOCAL_DEVELOPMENT.md`

## 11. Claude Code 권장 사용 흐름

Claude 템플릿을 루트에 복사한 뒤에는 아래 순서로 작업하게 하는 것을 권장합니다.

1. 현재 `apps/*`, `libs/*` 구조를 먼저 확인
2. 대상 앱의 서비스 경계를 식별
3. 새로운 기능에 필요한 최소 구조를 제안
4. 로컬 인프라 의존성 여부를 설명
5. 구현과 함께 테스트 추가 또는 수정
