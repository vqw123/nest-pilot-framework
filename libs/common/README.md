# @libs/common

요청 컨텍스트 관리와 요청 유틸리티를 제공하는 기반 라이브러리입니다.

## 제공 기능

### RequestContext

`AsyncLocalStorage` 기반으로 요청 스코프 데이터를 관리합니다. HTTP 요청 단위로 격리된 저장소를 제공하며, 별도의 DI 없이 어디서든 꺼내 쓸 수 있습니다.

```typescript
import { RequestContext } from '@libs/common';

// requestId 조회
const requestId = RequestContext.getRequestId();

// 클라이언트 IP 조회
const ip = RequestContext.getClientIp();

// 커스텀 값 저장/조회
RequestContext.set('userId', 'abc-123');
const userId = RequestContext.get('userId');
```

### RequestUtil

Express Request 객체에서 클라이언트 정보를 추출합니다.

```typescript
import { RequestUtil } from '@libs/common';

// 클라이언트 IP (CloudFront → X-Forwarded-For → request.ip 순으로 조회)
const ip = RequestUtil.getClientIp(request);

// 클라이언트 국가 (CloudFront 환경에서만 정확함)
const country = RequestUtil.getClientCountry(request);
```

## 참고

- `RequestContext`는 `LoggerModule`의 `HttpLoggerInterceptor`가 자동으로 초기화합니다.
- `getClientCountry()`는 CloudFront의 `cloudfront-viewer-country` 헤더를 사용하므로 CloudFront 없이는 빈 값을 반환합니다.
- `LoggerModule`을 사용하는 경우 별도 초기화 없이 `RequestContext.getRequestId()` 사용 가능합니다.
- ValidationPipe, Helmet/CORS, Rate Limiting은 `@libs/http`를 참고하세요.
