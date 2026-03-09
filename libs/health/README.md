# @libs/health

EKS 환경에 최적화된 liveness/readiness 헬스체크 엔드포인트를 제공하는 라이브러리입니다.

## 엔드포인트

| 엔드포인트 | 용도 | 설명 |
|---|---|---|
| `GET /health/liveness` | K8s liveness probe | 프로세스 생존 여부 확인, 항상 200 |
| `GET /health/readiness` | K8s readiness probe | 의존성(DB, Redis 등) 상태 확인 |

## 사용법

```typescript
import { HealthModule, DatabaseHealthIndicator, RedisHealthIndicator } from '@libs/health';

HealthModule.forRoot({
  readiness: [DatabaseHealthIndicator, RedisHealthIndicator],
})
```

`DatabaseModule`, `RedisModule`이 global로 등록되어 있으면 별도 import 없이 동작합니다.

## 기본 제공 Indicator

### DatabaseHealthIndicator

`SELECT 1` 쿼리로 DB 연결 상태를 확인합니다. `DatabaseModule`이 등록되어 있어야 합니다.

### RedisHealthIndicator

`PING` 명령으로 Redis 연결 상태를 확인합니다. `RedisModule`이 등록되어 있어야 합니다.

## 커스텀 Indicator

`HealthIndicatorContract` 인터페이스를 구현하면 커스텀 indicator를 추가할 수 있습니다.

```typescript
import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { HealthIndicatorContract } from '@libs/health';

@Injectable()
export class ExternalApiHealthIndicator implements HealthIndicatorContract {
  constructor(private readonly healthIndicatorService: HealthIndicatorService) {}

  async isHealthy(): Promise<Record<string, any>> {
    try {
      // 외부 API 체크 로직
      return this.healthIndicatorService.check('external-api').up();
    } catch {
      return this.healthIndicatorService.check('external-api').down({ message: 'API unavailable' });
    }
  }
}
```

```typescript
HealthModule.forRoot({
  readiness: [DatabaseHealthIndicator, ExternalApiHealthIndicator],
})
```

## Graceful Shutdown

`main.ts`에서 `enableShutdownHooks()`를 활성화하면 SIGTERM 수신 시 readiness가 자동으로 503을 반환합니다.

```typescript
// main.ts
app.enableShutdownHooks();
```

**동작 흐름:**
```
SIGTERM 수신
    → TerminationService.onModuleDestroy() 호출
    → readiness 503 반환
    → 로드밸런서에서 Pod 제외
    → terminationGracePeriodSeconds 동안 in-flight 요청 처리
    → 종료
```

`terminationGracePeriodSeconds`는 K8s deployment 설정에서 조정합니다. (기본값 30초)

## K8s Deployment 설정 예시

```yaml
livenessProbe:
  httpGet:
    path: /health/liveness
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health/readiness
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 5

terminationGracePeriodSeconds: 30
```
