# @libs/http

HTTP 파이프라인 관련 모듈을 제공하는 라이브러리입니다.
ValidationPipe, Helmet/CORS를 모듈 기반으로 조립할 수 있습니다.

## ValidationModule

`class-validator`, `class-transformer` 기반의 전역 ValidationPipe를 등록합니다.

```typescript
import { ValidationModule } from '@libs/http';

ValidationModule.forRoot({
  whitelist: true,            // DTO에 없는 필드 자동 제거
  forbidNonWhitelisted: true, // DTO에 없는 필드 요청 시 400
  transform: true,            // string → number 등 타입 자동 변환
})
```

`ValidationPipeOptions`를 그대로 받아서 NestJS `ValidationPipe`에 전달합니다. 옵션은 앱에서 직접 결정합니다.

DTO 예시:

```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

## SecurityModule

Helmet(HTTP 보안 헤더)과 CORS를 모듈 기반으로 설정합니다.

```typescript
import { SecurityModule } from '@libs/http';

SecurityModule.forRoot({
  helmet: {},                          // Helmet 기본 옵션으로 활성화
  cors: { origin: 'https://example.com' }, // CORS 활성화
})
```

옵션을 생략하면 해당 기능이 비활성화됩니다.

```typescript
// Helmet만 적용
SecurityModule.forRoot({ helmet: {} })

// CORS만 적용
SecurityModule.forRoot({ cors: { origin: '*' } })
```

**Helmet 주요 보안 헤더:**

| 헤더 | 방어 |
|---|---|
| `X-Content-Type-Options` | MIME 타입 스니핑 방지 |
| `X-Frame-Options` | 클릭재킹(iframe 삽입) 방지 |
| `Strict-Transport-Security` | HTTPS 강제 |
| `X-XSS-Protection` | XSS 방어 |
