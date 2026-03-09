# @libs/logger

Winston 기반 구조화 로깅과 HTTP 요청/응답 자동 로깅을 제공하는 라이브러리입니다.

## 사용법

```typescript
import { LoggerModule } from '@libs/logger';

// 동기 설정
LoggerModule.forRoot({ enableHttpInterceptor: true })

// 비동기 설정 (ConfigService 등 주입이 필요한 경우)
LoggerModule.forRootAsync({
  useFactory: () => ({ enableHttpInterceptor: true }),
})
```

## HTTP 인터셉터

`enableHttpInterceptor: true` 설정 시 모든 요청/응답을 자동으로 로깅합니다.

```
[abc-123] Request from 1.2.3.4(KR) - GET /users
[abc-123] Response to 1.2.3.4(KR) - GET /users - Status: 200 - Duration: 23ms
```

- `requestId`: `x-correlation-id` 헤더가 있으면 그 값을 사용, 없으면 UUID 생성
- 클라이언트 IP는 CloudFront → X-Forwarded-For → request.ip 순으로 추출
- 클라이언트 국가는 CloudFront 환경에서만 표시

## 로그 포맷

로컬 환경에서는 컬러 콘솔 출력, 그 외 환경에서는 JSON 포맷으로 출력합니다.

```json
{
  "level": "info",
  "message": "[abc-123] Request from 1.2.3.4 - GET /users",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "context": "HttpLoggerInterceptor"
}
```

## 커스텀 Transport 추가

```typescript
LoggerModule.forRoot({
  enableHttpInterceptor: true,
  transports: [new winston.transports.File({ filename: 'app.log' })],
})
```

## Correlation ID 전파 (MSA)

서비스 간 요청 추적을 위해 outgoing HTTP 요청에 `x-correlation-id` 헤더를 붙여야 합니다.

```typescript
import { RequestContext } from '@libs/common';

// axios interceptor 예시
axios.interceptors.request.use((config) => {
  config.headers['x-correlation-id'] = RequestContext.getRequestId();
  return config;
});
```
