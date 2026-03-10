# apps/auth — 통합 인증 서버

Google, Apple, Email 소셜 로그인 및 계정 연동을 처리하는 SSO 인증 서버.
RS256 JWT를 발급하고, 다른 서비스는 JWKS endpoint로 토큰을 검증한다.

---

## 아키텍처

```
클라이언트
  │
  ├─ POST /:projectId/signin/google   → Google Authorization Code → JWT 발급
  ├─ POST /:projectId/signin/email    → 이메일+비밀번호 → JWT 발급
  ├─ POST /:projectId/signup/email    → 회원가입 → 인증 메일 발송
  ├─ POST /:projectId/email/verify    → 인증 코드 확인 → JWT 발급
  ├─ POST /:projectId/link/google     → Google 계정 연동 (JWT 필요)
  ├─ DELETE /:projectId/link/google   → Google 계정 연동 해제 (JWT 필요)
  └─ GET  .well-known/jwks.json       → JWKS 공개키 (공개 endpoint)

Global prefix: api/v1/auth
Port: 3001 (local)
```

---

## DB 스키마 요약

| 테이블 | 역할 |
|---|---|
| `tb_auth_project_information` | 등록된 프로젝트 목록 |
| `tb_auth_oauth_config` | 프로젝트별 OAuth 클라이언트 설정 |
| `tb_auth_account` | 내부 계정 (uid = JWT sub, uuid = 내부 연동 키) |
| `tb_auth_social` | 소셜 계정 (provider + socialId → uuid 매핑, 전역) |
| `tb_auth_social_binding` | 프로젝트별 소셜 바인딩 (PK: projectId + provider + socialId) |
| `tb_auth_social_properties` | 소셜 프로필 속성 (email, name, picture 등) |
| `tb_auth_email_account` | 이메일 계정 (uuid + 비밀번호 해시 + 인증 코드) |

**uid vs uuid 구분**
- `uid` — JWT `sub`. 외부에 노출되는 숫자 ID
- `uuid` — 내부 연동 키. 서로 다른 소셜 계정을 하나의 계정으로 묶는 데 사용

---

## 주요 설계 결정

### JWKS 공개키 배포

auth 서버는 `GET /api/v1/auth/.well-known/jwks.json`으로 공개키를 제공한다.
`kid`는 RFC 7638 JWK Thumbprint (SHA-256 of `{e, kty, n}`)로 자동 계산된다.

다른 서비스는 `@libs/auth`의 `BearerModule`을 아래 두 가지 방식으로 설정할 수 있다.

```
로컬 개발   → publicKey (base64 PEM 직접 설정)
스테이징/운영 → jwksUri  (auth 서버 또는 CDN URL)
```

### 소셜 로그인 플로우

```
signInWithSocial(projectId, { provider, socialId, properties })
  ↓
1. social_binding(projectId, provider, socialId) 존재? → 기존 유저, uid 반환
2. social(provider, socialId) 존재? → 다른 프로젝트 가입 유저 → binding만 추가
3. 없음? → account + social + binding 신규 생성 (트랜잭션)
```

### 계정 연동 제약

- 서로 다른 provider는 명시적 연동(link)으로만 같은 계정이 됨
- 연동 해제 시 최소 1개 로그인 수단(소셜 또는 이메일) 유지 강제

---

## 로컬 실행

```bash
# 환경 설정 확인
cat apps/auth/config/local/app.config.yml
cat apps/auth/config/local/database.yml
cat apps/auth/config/local/jwt.yml

# 실행
npx nest start auth --watch
```

**Swagger UI**: http://localhost:3001/docs

---

## RSA 키 쌍 생성 (로컬 개발용)

```bash
# 키 생성
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem

# base64 인코딩 → jwt.yml에 설정
base64 -i private.pem | tr -d '\n'
base64 -i public.pem  | tr -d '\n'
```

---

## 테스트 실행

```bash
# apps/auth 단위 테스트 전체
npx jest --testPathPattern="apps/auth"

# 특정 서비스만
npx jest --testPathPattern="apps/auth/test/account"
npx jest --testPathPattern="apps/auth/test/link"

# 커버리지
npx jest --testPathPattern="apps/auth" --coverage
```

### 테스트 파일 목록

| 파일 | 대상 | 테스트 수 |
|---|---|---|
| `token.service.spec.ts` | JWT 발급/검증, JWKS 포맷 | 5 |
| `account.service.spec.ts` | 소셜 로그인 3가지 경로 | 3 |
| `email-signin.service.spec.ts` | 이메일 로그인 | 4 |
| `apple-signin.service.spec.ts` | Apple 로그인 (미구현) | 2 |
| `email-signup.service.spec.ts` | 이메일 회원가입 | 3 |
| `email.service.spec.ts` | 인증 코드 확인/재발송 | 7 |
| `link.service.spec.ts` | 소셜 연동/해제 | 9 |

---

## 환경 변수 (config 구조)

```yaml
# app.config.yml
app:
  name: auth
  version: 1.0.0
server:
  port: 3001

# jwt.yml
jwt:
  privateKey: <base64 RSA private key PEM>
  publicKey:  <base64 RSA public key PEM>
  issuer:     your-issuer
  expiresIn:  1d

# database.yml
database:
  host: localhost
  port: 3306
  username: root
  password: password
  database: db_auth
```
