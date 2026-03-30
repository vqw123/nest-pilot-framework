# 새 앱 체크리스트

`apps/*` 아래에 새로운 앱을 추가할 때 사용하는 체크리스트입니다.

## 1. 기본 생성

- [ ] `nest generate app {appName}` 실행
- [ ] `apps/{appName}` 구조 확인
- [ ] 앱의 역할과 서비스 경계 정의

## 2. 설정

- [ ] `apps/{appName}/config/local` 생성
- [ ] `app.yml` 작성
- [ ] `server.yml` 작성
- [ ] `database.yml` 작성
- [ ] `redis.yml` 작성
- [ ] 필요 시 `development`, `production` 환경 설정 추가

## 3. 모듈 등록

- [ ] `ConfigModule` 등록
- [ ] `LoggerModule` 등록
- [ ] `ErrorModule` 등록
- [ ] `HealthModule` 등록
- [ ] `DatabaseModule` 필요 여부 확인 및 등록
- [ ] `RedisModule` 필요 여부 확인 및 등록
- [ ] `Swagger` 설정 필요 여부 확인
- [ ] 인증이 필요하면 auth 관련 모듈/guard 확인

## 4. 런타임 점검

- [ ] `main.ts`에서 `enableShutdownHooks()` 사용 여부 확인
- [ ] listen 포트 확인
- [ ] readiness/liveness 영향 확인
- [ ] 로컬 의존성 연결 정보 확인

## 5. 로컬 실행

- [ ] 필요한 Compose 파일 선택
- [ ] Redis 실행 여부 확인
- [ ] DB 실행 여부 확인
- [ ] PostgreSQL 필요 여부 확인
- [ ] `nest start {appName} --watch` 실행 확인

## 6. 테스트

- [ ] 핵심 비즈니스 로직 unit test 작성
- [ ] 필요 시 controller test 작성
- [ ] integration 또는 e2e test 확인
- [ ] mock 전략 정리
- [ ] 변경 동작에 대한 테스트 누락 여부 확인

## 7. 문서

- [ ] README 실행 방법 갱신
- [ ] 로컬 개발 문서 갱신
- [ ] 새 config key 문서화
- [ ] 새 의존성 문서화

## 8. 구조 검토

- [ ] Controller가 얇은가
- [ ] Service에 비즈니스 로직이 모여 있는가
- [ ] app 전용 로직이 `libs/*`로 새지 않았는가
- [ ] 테스트 가능한 구조인가
- [ ] 운영/로그/헬스체크 관점 누락이 없는가
