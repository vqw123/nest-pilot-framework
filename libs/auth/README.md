# @libs/auth

Bearer JWT, Basic Auth, IP 필터 Guard를 제공하는 공용 인증 라이브러리.

서비스는 필요한 Guard만 골라 `forRootAsync`로 등록하고, 컨트롤러에 `@UseGuards()`로 적용한다.

---

## 모듈 구성

| 모듈 | Guard | 설명 |
|---|---|---|
| `BearerModule` | `BearerGuard` | RS256 JWT 검증. JWKS endpoint 또는 정적 공개키 지원 |
| `BasicModule` | `BasicGuard` | Basic Auth 추출 + 커스텀 validate 함수 DI |
| `IpModule` | `IpGuard` | CIDR 기반 whitelist / blacklist |

---

## BearerModule

### 동작 원리

JWT 헤더의 `kid`로 JWKS endpoint에서 공개키를 조회해 RS256 서명을 검증한다.
`jwks-rsa`가 공개키를 10분간 캐시해 auth 서버 부하를 낮춘다.

```
Request → BearerGuard → BearerStrategy
  → Authorization: Bearer <token> 추출
  → kid로 JWKS endpoint fetch (캐시)
  → RS256 서명 검증
  → request.user = JwtPayload
```

### 공개키 소스 선택

| 환경 | 설정 |
|---|---|
| 로컬 개발 | `publicKey` (base64 PEM) — auth 서버 없이 직접 검증 |
| 스테이징/운영 | `jwksUri` — auth 서버 JWKS endpoint 직접 |
| CDN 앞단 | `jwksUri` — CDN URL (CloudFront 등) |

`jwksUri`와 `publicKey` 중 하나만 설정. 둘 다 없으면 앱 시작 시 에러.

### 등록

```typescript
// app.module.ts
import { BearerModule } from '@libs/auth';

@Module({
  imports: [
    BearerModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        // 로컬: config에 base64 공개키 직접 설정
        publicKey: config.get('jwt.publicKey'),

        // 운영: JWKS endpoint (auth 서버 또는 CDN URL)
        // jwksUri: config.get('auth.jwksUri'),

        issuer: config.get('auth.issuer'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### 컨트롤러 적용

```typescript
import { BearerGuard, CurrentUser, JwtPayload } from '@libs/auth';

@UseGuards(BearerGuard)
@Controller('orders')
export class OrderController {
  @Get('me')
  getMyOrders(@CurrentUser() user: JwtPayload) {
    return this.orderService.findByUid(user.sub);
  }
}
```

### JWKS endpoint

auth 서버는 `GET /api/v1/auth/.well-known/jwks.json`을 제공한다.

```json
{
  "keys": [
    {
      "kty": "RSA",
      "n": "...",
      "e": "AQAB",
      "kid": "AbCdEfGh12345678",
      "use": "sig",
      "alg": "RS256"
    }
  ]
}
```

CDN에서 캐시할 경우 이 URL을 `jwksUri`로 지정한다.

---

## BasicModule

username:password를 검증하는 로직을 `validate` 함수로 주입한다.
DB 조회, 설정값 비교 등 앱 로직은 팩토리 함수 안에서 자유롭게 구현한다.

```typescript
import { BasicModule, BasicGuard } from '@libs/auth';

@Module({
  imports: [
    BasicModule.forRootAsync({
      useFactory: (keyService: ApiKeyService) => ({
        validate: (username, password) => keyService.verify(username, password),
      }),
      inject: [ApiKeyService],
    }),
  ],
})
export class AppModule {}

// 컨트롤러
@UseGuards(BasicGuard)
@Post('webhook')
handleWebhook(@Body() body: WebhookDto) { ... }
```

---

## IpModule

`whitelist`가 설정된 경우 해당 CIDR에 속한 IP만 통과한다.
`blacklist`는 whitelist 통과 여부와 무관하게 항상 차단한다.

IP는 `cloudfront-viewer-address` → `x-forwarded-for` → `req.ip` 순서로 추출한다.

```typescript
import { IpModule, IpGuard } from '@libs/auth';

@Module({
  imports: [
    IpModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        whitelist: config.get('security.ipWhitelist'), // ['10.0.0.0/8', '192.168.1.0/24']
        blacklist: config.get('security.ipBlacklist'), // ['1.2.3.4/32']
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}

// 컨트롤러
@UseGuards(IpGuard)
@Get('internal/metrics')
getMetrics() { ... }
```

---

## JwtPayload

auth 서버가 발급하는 JWT payload 타입.

```typescript
export interface JwtPayload {
  sub: number; // uid (JWT 외부 식별자)
  iss: string; // issuer
  iat: number; // issued at
  exp: number; // expiration
}
```

---

## 테스트 실행

```bash
# libs/auth 단위 테스트
npx jest --testPathPattern="libs/auth"

# 커버리지 포함
npx jest --testPathPattern="libs/auth" --coverage
```
