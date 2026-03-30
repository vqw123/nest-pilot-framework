# apps/auth — 사내 통합 인증 플랫폼 (Internal SSO Platform)

여러 사내 서비스/프로젝트가 공유하는 중앙 인증 서버.
Firebase Auth의 사용 모델과 유사하지만 단일 회사 내부 프로젝트에 특화된다.
각 서비스는 별도 인증을 구현하지 않고 이 auth 서버를 재사용한다.

---

## 핵심 도메인 모델

```
account          — 통합 계정. uid(내부 PK), uuid(외부 식별자)
  │
  ├─ identity         — OAuth provider 매핑 (provider + providerUserId → uid). 계정 전역.
  ├─ email_identity   — 이메일/비밀번호 인증. 계정 전역.
  └─ project_account  — 프로젝트 멤버십. (projectId, uid) 쌍으로 관리.
```

### uid vs uuid

| 필드 | 범위 | 용도 |
|------|------|------|
| `uid` | 내부 전용 (bigint) | DB PK/FK, 테이블 간 조인 |
| `uuid` | 외부 노출 가능 | JWT `sub`, API 응답, 다른 서비스와 통신 |

> **규칙**: auth 서버 내부 테이블 간 FK는 항상 `uid`를 사용한다.
> `uuid`는 절대 내부 FK로 사용하지 않는다.

### JWT 구조

```
sub  = account.uuid        ← 외부 식별자
aud  = projectId           ← 어느 프로젝트를 위한 토큰인가
iss  = auth-server
jti  = 토큰 고유 UUID
```

---

## API 구조

```
Global prefix: api/v1/auth
Port: 3001 (local)
```

### 프로젝트 인식 (project-aware)

signin/signup/email 엔드포인트는 `/:projectId` 경로를 포함한다.

```
POST /:projectId/signin/google    → Google ID Token 로그인
POST /:projectId/signin/email     → 이메일 로그인
POST /:projectId/signup/google    → Google ID Token 회원가입
POST /:projectId/signup/email     → 이메일 회원가입 (인증 메일 발송)
POST /:projectId/email/verify     → 인증 코드 확인 → 세션 발급
POST /:projectId/email/resend     → 인증 코드 재발송
```

모든 로그인/가입 응답: `{ accessToken, refreshToken }` (이메일 회원가입 제외)

### 계정 전역 (account-global)

link/unlink는 프로젝트와 무관한 계정 수준 작업이다.
`projectId` 경로 파라미터 없이 Bearer JWT로 계정을 식별한다.

```
POST   /account/link/google    → Google 계정 연동 (JWT 필요)
DELETE /account/link/google    → Google 계정 연동 해제 (JWT 필요)
```

> Google OAuth 설정 조회에는 JWT `aud`(projectId)를 사용한다.

### 세션 관리

```
POST /session/refresh    → Refresh token으로 세션 갱신 (token rotation)
POST /session/logout     → Refresh token 폐기 (로그아웃)
```

### 공개 엔드포인트

```
GET /.well-known/jwks.json         → JWKS 공개키 (인증 불필요)
GET /:projectId/token/public-key   → JWK 단건
```

---

## 세션 모델

### Access Token
- RS256 JWT, 단기 만료 (기본 1일, `jwt.expiresIn`으로 변경 가능)
- `sub=uuid`, `aud=projectId`, `kid`로 JWKS 키 조회 지원

### Refresh Token
- Opaque UUID, Redis에 저장, TTL 30일
- Redis key: `auth:session:{refreshToken}` → `{ uuid, projectId }`
- 갱신 시 token rotation 적용 (구 토큰 즉시 폐기)
- 로그아웃 시 Redis key 삭제로 즉시 무효화

다른 서비스는 JWKS endpoint로 access token을 독립 검증하며,
refresh token은 auth 서버 내부에서만 처리된다.

---

## 소셜 로그인 플로우

```
signUpWithSocial(projectId, profile)
  │
  ├─ project_account(projectId + uid) 존재?  → 기존 프로젝트 회원 → uuid 반환
  ├─ identity(provider + providerUserId) 존재? → 다른 프로젝트 가입 유저 → project_account만 추가
  └─ 없음 → account + identity + project_account 신규 생성 (트랜잭션)
```

---

## 계정 연동 정책

- `link`: 지원 — 다른 provider를 현재 계정에 연결
- `unlink`: 지원 — 단, 해제 후 로그인 수단(소셜 + 이메일)이 1개 이상 남아야 함
- **account merge**: 미지원 — 별도 계정을 합치는 기능 없음
- identity는 계정 전역이며 프로젝트 범위가 없다

---

## OAuth 설정

OAuth provider 설정(`client_id`, `client_secret`, `redirect_uri`, `scope`)은
모두 DB에서 관리하는 운영 데이터다.

- `redirect_uri`는 DB에 저장되며 config 파일로 이동하지 않는다
- 설정 변경은 DB를 직접 수정하거나 관리 도구를 통해 처리한다

---

## DB 스키마 요약

| 테이블 | 역할 |
|---|---|
| `account` | 통합 계정 (uid, uuid) |
| `identity` | OAuth provider 매핑 (provider + providerUserId → uid, 계정 전역) |
| `identity_properties` | OAuth provider에서 가져온 프로필 데이터 |
| `email_identity` | 이메일/비밀번호 인증 + 인증 코드 |
| `project_account` | 프로젝트 멤버십 (projectId + uid) |
| `project` | 등록된 프로젝트 목록 |
| `oauth_config` | 프로젝트별 OAuth 클라이언트 설정 |

---

## JWKS 공개키 배포

auth 서버는 `GET /api/v1/auth/.well-known/jwks.json`으로 공개키를 제공한다.
`kid`는 RFC 7638 JWK Thumbprint (SHA-256 of `{e, kty, n}`)로 계산된다.

다른 서비스의 `@libs/auth BearerModule` 설정:

```
로컬 개발   → publicKey: base64 PEM 직접 설정
스테이징/운영 → jwksUri: auth 서버 또는 CDN URL
```

---

## 로컬 실행

```bash
# 인프라 실행 (MySQL, Redis)
bash .docker/start.sh

# 앱 실행
npx nest start auth --watch
```

**Swagger UI**: http://localhost:3001/docs

### 환경 설정 파일

```yaml
# apps/auth/config/local/app.config.yml
app:
  name: auth
  version: 1.0.0
server:
  port: 3001

# apps/auth/config/local/jwt.yml
jwt:
  privateKey: <base64 RSA-2048 private key PEM>
  publicKey:  <base64 RSA-2048 public key PEM>
  issuer:     auth-server
  expiresIn:  1d

# apps/auth/config/local/database.yml
database:
  host: localhost
  port: 3306
  username: root
  password: ...
  database: db_auth

# apps/auth/config/local/redis.yml
redis:
  config:
    - host: localhost
      port: 6379
      namespace: default
```

### RSA 키 쌍 생성 (로컬 개발용)

```bash
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem

base64 -i private.pem | tr -d '\n'   # → jwt.yml privateKey
base64 -i public.pem  | tr -d '\n'   # → jwt.yml publicKey
```

---

## 테스트 실행

```bash
# 전체 단위 테스트
npx jest --testPathPattern="apps/auth"

# 커버리지
npx jest --testPathPattern="apps/auth" --coverage
```

### 테스트 파일 목록

| 파일 | 대상 | 주요 시나리오 |
|---|---|---|
| `token.service.spec.ts` | JWT 발급/검증, JWKS | sign, verify, kid 일관성 |
| `session.service.spec.ts` | 세션 생성/갱신/폐기 | createSession, refreshSession(rotation), revokeSession |
| `account.service.spec.ts` | 소셜 계정 처리 | signIn(3가지 경로), signUp |
| `email-signin.service.spec.ts` | 이메일 로그인 | 미인증, 비밀번호 불일치 등 |
| `email-signup.service.spec.ts` | 이메일 회원가입 | 중복 이메일, 트랜잭션 |
| `email.service.spec.ts` | 인증 코드 | 만료, 재발송 |
| `link.service.spec.ts` | 소셜 연동/해제 | 중복 연동, 마지막 수단 해제 방지 |
| `google-signin.service.spec.ts` | Google 검증 | 설정 없음, 토큰 검증 실패 |
| `apple-signin.service.spec.ts` | Apple (미구현) | NotImplementedException |
