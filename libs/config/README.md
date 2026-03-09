# @libs/config

YAML 기반 환경별 설정 파일을 로드하고 타입 안전하게 접근하는 라이브러리입니다.

## 설정 파일 구조

```
apps/{appName}/config/{NODE_ENV}/
├── app.yml
├── server.yml
├── database.yml
└── redis.yml
```

`NODE_ENV` 기본값은 `local`입니다.

## 사용법

```typescript
import { ConfigModule, ConfigService } from '@libs/config';

// AppModule
ConfigModule.forRoot({ appName: 'example' })
```

```typescript
// 서비스에서 사용
@Injectable()
export class SomeService {
  constructor(private readonly configService: ConfigService) {}

  getPort() {
    return this.configService.get<number>('server.port');
  }
}
```

## ConfigService

dot notation으로 중첩 키에 접근합니다.

```typescript
configService.get('server.port')       // 단일 값
configService.get('database')          // 객체 전체
configService.get<number>('server.port') // 타입 지정
```

## 옵션

| 옵션 | 설명 | 기본값 |
|---|---|---|
| `appName` | 앱 이름 (설정 파일 경로 결정) | 필수 |
| `configPath` | 설정 파일 경로 직접 지정 | `apps/{appName}/config/{NODE_ENV}` |
