## 스타터 프로젝트 부트스트랩 가이드

이 저장소는 단순한 예제 저장소가 아니라, 새로운 NestJS 백엔드 프로젝트를 빠르게 시작하기 위한 스타터 프레임워크입니다.

이 저장소에는 아래와 같은 부트스트랩 리소스가 포함됩니다.

- 아키텍처 및 개발 가이드: `docs/starter-guide`
- Claude Code 템플릿: `templates/claude`
- 로컬 인프라 실행용 Docker Compose 템플릿: `docker/compose`

### 새 프로젝트 시작 권장 순서

1. 이 저장소를 복사하거나 템플릿처럼 사용합니다.
2. 의존성을 설치합니다.
3. Claude 템플릿을 새 프로젝트 루트로 복사합니다.
4. `docs/starter-guide/NEW_PROJECT_BOOTSTRAP.md`를 따라 초기 설정을 진행합니다.
5. 필요한 로컬 의존성을 Docker Compose로 실행합니다.
6. 대상 앱을 Nest CLI 또는 npm script로 직접 실행합니다.

### 예시

```bash
cp -R nest-pilot-framework my-new-backend
cd my-new-backend
npm install
cp templates/claude/CLAUDE.md ./CLAUDE.md
cp -R templates/claude/.claude ./.claude
```

### 스타터 가이드 문서

- `docs/starter-guide/ARCHITECTURE_PRINCIPLES.md`
- `docs/starter-guide/NEW_PROJECT_BOOTSTRAP.md`
- `docs/starter-guide/NEW_APP_CHECKLIST.md`
- `docs/starter-guide/LOCAL_DEVELOPMENT.md`

### Claude 템플릿 파일

- `templates/claude/CLAUDE.md`
- `templates/claude/.claude/skills/nest-backend-feature-builder/SKILL.md`
- `templates/claude/.claude/skills/local-runtime-and-compose/SKILL.md`
- `templates/claude/.claude/skills/safe-refactor/SKILL.md`

### 로컬 Docker Compose 템플릿

- `docker/compose/docker-compose.redis.yml`
- `docker/compose/docker-compose.mysql.yml`
- `docker/compose/docker-compose.postgres.yml`
- `docker/compose/docker-compose.mssql.yml`
- `docker/compose/docker-compose.zookeeper.yml`
- `docker/compose/docker-compose.local-full.yml`

### 일반적인 로컬 실행 예시

```bash
docker compose -f docker/compose/docker-compose.redis.yml up -d
docker compose -f docker/compose/docker-compose.mysql.yml up -d
nest start auth --watch
```

또는 전체 의존성을 한 번에 실행하는 경우:

```bash
docker compose -f docker/compose/docker-compose.local-full.yml up -d
nest start auth --watch
```

### 권장 개발 방식

개발할 때는 아래 방식을 권장합니다.

- 앱 자체는 로컬에서 직접 실행
- Redis, DB, ZooKeeper 같은 의존성은 Docker Compose로 실행
- 기능 추가 전에 `apps/*`, `libs/*` 구조를 먼저 확인
- 변경 시 실행 방법, 설정, 테스트도 함께 갱신

### Claude Code 사용 권장 방식

새 프로젝트에서 Claude Code를 사용할 때는:

1. `CLAUDE.md`와 `.claude/skills`를 프로젝트 루트에 복사합니다.
2. 작업 전에 현재 `apps/*`, `libs/*` 구조를 먼저 읽게 합니다.
3. 기능 구현 시 서비스 경계, 공용 모듈 재사용 여부, 로컬 실행 영향, 테스트 영향을 함께 검토하게 합니다.

이 스타터는 NestJS 철학, MSA 지향 구조, SOLID 원칙, TDD 친화 구조, Kubernetes 기반 운영 환경을 고려한 방향을 기본값으로 삼습니다.
