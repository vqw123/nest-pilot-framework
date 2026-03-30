# nest-pilot-framework

실무 NestJS 서비스 개발 과정에서 반복적으로 필요했던 공통 기능과, 운영하면서 아쉬웠던 구조를 보완하기 위해 재구성한 Monorepo 기반 스타터 프레임워크입니다.

실서비스 코드를 그대로 공개한 저장소가 아니라, 새 서비스를 빠르게 시작할 수 있는 공통 모듈 구조, 코드 스타일, 테스트 방식, 운영 친화적인 설계 포인트를 보여주기 위한 포트폴리오입니다.

새 서비스는 `apps/`에 추가하고, `libs/`의 공통 라이브러리를 재사용할 수 있도록 구성했습니다.

## 프로젝트 구조

```
nest-pilot-framework/
├── apps/
│   ├── auth/          # 인증 서비스
│   └── example/       # 예제 앱
└── libs/
    ├── common/        # RequestContext, RequestUtil
    ├── config/        # YAML 기반 환경별 설정
    ├── logger/        # Winston 로깅 + HTTP 인터셉터
    ├── error/         # 전역 예외 처리 + 표준 에러 포맷
    ├── database/      # TypeORM 연결 관리
    ├── redis/         # ioredis 연결 관리
    ├── health/        # liveness/readiness 헬스체크
    ├── http/          # ValidationPipe, Helmet/CORS
    ├── swagger/       # Swagger 문서화
    └── auth/          # Bearer JWT, Basic Auth, IP 필터 Guard
```

각 라이브러리의 자세한 사용법은 해당 디렉토리의 `README.md`를 참고하세요.

## 설치

```bash
npm install
```

## 실행

```bash
# example 앱 개발 모드
nest start example --watch

# example 앱 일반 실행
nest start example

# auth 앱 개발 모드
nest start auth --watch
```

## 빌드

```bash
# 전체 빌드
npm run build

# 특정 앱 빌드
nest build example
nest build auth
```

## 테스트

### Unit Test

```bash
# 전체 실행
npm test

# 특정 앱 또는 라이브러리만 실행
npx jest apps/example
npx jest apps/auth
npx jest libs/common
npx jest libs/config
npx jest libs/logger
npx jest libs/error
npx jest libs/database
npx jest libs/redis
npx jest libs/health
npx jest libs/http
npx jest libs/swagger
npx jest libs/auth

# watch 모드
npm run test:watch

# 커버리지 포함
npm run test:cov
```

### E2E Test

E2E 테스트는 앱별 `jest-e2e.json` 설정을 사용합니다.

```bash
# example 앱 e2e
npx jest --config ./apps/example/test/jest-e2e.json
```

> E2E 테스트는 실제 DB/Redis 없이 실행됩니다.
> Repository와 RedisService를 mock으로 대체하고 supertest로 HTTP 파이프라인 전체를 검증합니다.

## 새 앱 추가

```bash
nest generate app {appName}
```

생성 후 `AppModule`에서 필요한 라이브러리를 등록합니다.

```typescript
@Module({
  imports: [
    LoggerModule.forRootAsync({ ... }),
    ConfigModule.forRoot({ appName: '{appName}' }),
    ErrorModule.forRoot(),
    DatabaseModule.forRootAsync({ ... }),
    RedisModule.forRootAsync({ ... }),
    HealthModule.forRoot({
      readiness: [DatabaseHealthIndicator, RedisHealthIndicator],
    }),
    // JWT 인증이 필요한 경우 (auth 서버 JWKS endpoint 또는 로컬 공개키)
    BearerModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        jwksUri: config.get('auth.jwksUri'), // 운영
        // publicKey: config.get('jwt.publicKey'), // 로컬
        issuer: config.get('auth.issuer'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Graceful Shutdown: SIGTERM 수신 시 readiness 503 반환 → 로드밸런서 제외 후 종료
  app.enableShutdownHooks();

  await app.listen(3000);
}
```

## 환경 설정 파일

앱별로 환경별 YAML 설정 파일을 관리합니다.

```
apps/{appName}/config/
├── local/
│   ├── app.yml
│   ├── server.yml
│   ├── database.yml
│   └── redis.yml
├── development/
└── production/
```

`NODE_ENV` 환경변수로 로드할 설정을 결정합니다. (기본값: `local`)

## 라이브러리 목록

| 라이브러리       | 설명                                         | README                              |
| ---------------- | -------------------------------------------- | ----------------------------------- |
| `@libs/common`   | RequestContext, RequestUtil                  | [바로가기](libs/common/README.md)   |
| `@libs/config`   | YAML 기반 설정 관리                          | [바로가기](libs/config/README.md)   |
| `@libs/logger`   | Winston 로깅, HTTP 인터셉터, Correlation ID  | [바로가기](libs/logger/README.md)   |
| `@libs/error`    | 전역 예외 처리, 표준 에러 포맷               | [바로가기](libs/error/README.md)    |
| `@libs/database` | TypeORM 연결, Repository 패턴                | [바로가기](libs/database/README.md) |
| `@libs/redis`    | ioredis 연결 관리, 멀티 네임스페이스         | [바로가기](libs/redis/README.md)    |
| `@libs/health`   | liveness/readiness, Graceful Shutdown        | [바로가기](libs/health/README.md)   |
| `@libs/http`     | ValidationPipe, Helmet/CORS                  | [바로가기](libs/http/README.md)     |
| `@libs/swagger`  | Swagger 문서화                               | [바로가기](libs/swagger/README.md)  |
| `@libs/auth`     | Bearer JWT (JWKS), Basic Auth, IP 필터 Guard | [바로가기](libs/auth/README.md)     |

## 스타터 프로젝트로 사용하는 방법

이 저장소는 단순 예제 프로젝트가 아니라, 새로운 NestJS 백엔드 프로젝트를 빠르게 시작하기 위한 스타터 프레임워크입니다.

새 프로젝트를 시작할 때는 아래 순서를 권장합니다.

### 1. 저장소 복사 또는 템플릿처럼 사용

```bash
cp -R nest-pilot-framework my-new-backend
cd my-new-backend
npm install
```

### 2. Claude 템플릿 복사

```bash
cp templates/claude/CLAUDE.md ./CLAUDE.md
cp -R templates/claude/.claude ./.claude
```

### 3. 새 앱 생성 또는 기존 앱 정리

```bash
nest generate app {appName}
```

또는 기존 `auth`, `example` 앱을 정리해서 시작할 수 있습니다.

### 4. 로컬 인프라 실행

macOS / Linux:

```bash
sh .docker/start.sh
```

Windows PowerShell:

```powershell
.docker/start.ps1
```

직접 Docker Compose를 실행하려면:

```bash
docker compose -f .docker/docker-compose.yml up -d
```

### 5. 앱 실행

```bash
nest start {appName} --watch
```

또는 프로젝트 스크립트에 맞춰:

```bash
npm run start {appName}
```

### 6. 상세 문서

자세한 가이드는 아래 문서를 참고하세요.

- `docs/starter-guide/ARCHITECTURE_PRINCIPLES.md`
- `docs/starter-guide/NEW_PROJECT_BOOTSTRAP.md`
- `docs/starter-guide/NEW_APP_CHECKLIST.md`
- `docs/starter-guide/LOCAL_DEVELOPMENT.md`

## Claude Code 템플릿

이 저장소에는 새 프로젝트에서 바로 사용할 수 있도록 Claude Code 템플릿을 함께 제공합니다.

- `templates/claude/CLAUDE.md`
- `templates/claude/.claude/skills/nest-backend-feature-builder/SKILL.md`
- `templates/claude/.claude/skills/local-runtime-and-compose/SKILL.md`
- `templates/claude/.claude/skills/safe-refactor/SKILL.md`

새 프로젝트 시작 시 위 파일들을 루트에 복사해서 사용하면 됩니다.
