# @libs/redis

ioredis 기반 Redis 연결 관리를 제공하는 라이브러리입니다. 단일 연결과 다중 네임스페이스 연결을 지원합니다.

## 사용법

### 단일 연결

```typescript
import { RedisModule } from '@libs/redis';

RedisModule.forRoot({
  config: {
    host: 'localhost',
    port: 6379,
  },
})

// 비동기 설정
RedisModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    ...configService.get('redis'),
  }),
  inject: [ConfigService],
})
```

### 다중 연결 (네임스페이스)

```typescript
RedisModule.forRoot({
  config: [
    { namespace: 'cache', host: 'localhost', port: 6379 },
    { namespace: 'session', host: 'localhost', port: 6380 },
  ],
})
```

## RedisService

```typescript
import { RedisService } from '@libs/redis';

@Injectable()
export class SomeService {
  constructor(private readonly redisService: RedisService) {}

  async example() {
    // 단일 연결
    const redis = this.redisService.getOrThrow();

    // 네임스페이스 지정
    const cache = this.redisService.getOrThrow('cache');
    const session = this.redisService.getOrThrow('session');

    await redis.set('key', 'value');
    const value = await redis.get('key');
  }
}
```

| 메서드 | 설명 |
|---|---|
| `getOrThrow(namespace?)` | 클라이언트 반환, 없으면 throw |
| `getOrNil(namespace?)` | 클라이언트 반환, 없으면 null |

## config 예시

```yaml
# apps/{appName}/config/{NODE_ENV}/redis.yml
redis:
  config:
    host: localhost
    port: 6379
```
