# @libs/error

전역 예외 처리와 표준 에러 응답 포맷을 제공하는 라이브러리입니다.

## 사용법

```typescript
import { ErrorModule } from '@libs/error';

ErrorModule.forRoot()

// 커스텀 필터 추가
ErrorModule.forRoot({
  customFilters: [{ provide: APP_FILTER, useClass: MyCustomFilter }],
})
```

## 에러 응답 포맷

예외 종류에 따라 응답 포맷이 다릅니다.

**BaseHttpException** — 우리 포맷
```json
{ "code": "USER_NOT_FOUND", "message": "User not found" }
```

**일반 HttpException** (ValidationPipe 등 NestJS 내부 예외) — NestJS 기본 포맷
```json
{ "statusCode": 400, "message": ["email must be an email"], "error": "Bad Request" }
```

**그 외** — GlobalExceptionFilter → 500
```json
{ "code": "INTERNAL_SERVER_ERROR", "message": "Unexpected internal server error." }
```

## 예외 클래스

### BaseHttpException

HTTP 상태코드와 함께 에러 코드를 전달합니다.

```typescript
import { BaseHttpException } from '@libs/error';

// 기본 400
throw new BaseHttpException('USER_NOT_FOUND', 'User not found');

// 상태코드 지정
throw new BaseHttpException('USER_NOT_FOUND', 'User not found', HttpStatus.NOT_FOUND);

// 확장
export class UserNotFoundException extends BaseHttpException {
  constructor() {
    super('USER_NOT_FOUND', 'User not found', HttpStatus.NOT_FOUND);
  }
}
```

### BaseDomainException

HTTP와 무관한 도메인 예외입니다. 전역 필터가 500으로 처리합니다.

```typescript
import { BaseDomainException } from '@libs/error';

throw new BaseDomainException('EMAIL_EXISTS', 'Email already exists');
```

## 필터 동작 순서

1. `HttpExceptionFilter` — `HttpException` 계열 처리
   - `BaseHttpException`이면 → `{ code, message }` 포맷
   - 그 외 `HttpException`이면 → NestJS 기본 포맷 그대로
2. `GlobalExceptionFilter` — 나머지 모든 예외 처리 → 500 응답

## BaseErrorCode

```typescript
enum BaseErrorCode {
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}
```

앱에서 도메인별 에러 코드는 별도 enum으로 정의하고 `BaseHttpException`에 제네릭으로 넘깁니다.

```typescript
enum UserErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_EXISTS = 'EMAIL_EXISTS',
}

throw new BaseHttpException<UserErrorCode>(UserErrorCode.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);
```
