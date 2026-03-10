# @libs/swagger

각 서비스에 Swagger UI를 붙이는 라이브러리입니다.

## 기본 사용법

```typescript
// app.module.ts
@Module({
  imports: [
    SwaggerModule.forRoot({
      title: 'Auth API',
      description: '인증 서비스 API 문서',
      version: '1.0',
    }),
  ],
})
export class AppModule {}
```

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  app.get(SwaggerService).setup(app);
  await app.listen(3000);
}
```

Swagger UI는 `/docs` 경로에서 확인할 수 있습니다.

## 전체 옵션

### DocumentBuilder 옵션

| 옵션               | 타입                                      | 설명              |
| ------------------ | ----------------------------------------- | ----------------- |
| `title`            | `string`                                  | 필수. API 제목    |
| `description`      | `string`                                  | 필수. API 설명    |
| `version`          | `string`                                  | 필수. API 버전    |
| `termsOfService`   | `string`                                  | 서비스 약관 URL   |
| `contact`          | `{ name, url, email }`                    | 연락처 정보       |
| `license`          | `{ name, url }`                           | 라이선스 정보     |
| `openApiVersion`   | `string`                                  | OpenAPI 스펙 버전 |
| `externalDocs`     | `{ description, url }`                    | 외부 문서 링크    |
| `servers`          | `{ url, description?, variables? }[]`     | 서버 목록         |
| `tags`             | `{ name, description?, externalDocs? }[]` | 태그 목록         |
| `extensions`       | `{ key, value }[]`                        | OpenAPI 확장 필드 |
| `globalParameters` | `ParameterObject[]`                       | 전역 파라미터     |
| `auth`             | `SwaggerAuthOptions`                      | 인증 방식 설정    |

### UI 옵션

| 옵션              | 타입                 | 기본값   | 설명                           |
| ----------------- | -------------------- | -------- | ------------------------------ |
| `path`            | `string`             | `'docs'` | Swagger UI 경로                |
| `useGlobalPrefix` | `boolean`            | -        | NestJS 글로벌 prefix 적용 여부 |
| `jsonDocumentUrl` | `string`             | -        | JSON 스펙 노출 경로            |
| `yamlDocumentUrl` | `string`             | -        | YAML 스펙 노출 경로            |
| `explorer`        | `boolean`            | -        | 상단 탐색바 표시 여부          |
| `customCss`       | `string`             | -        | 커스텀 CSS                     |
| `customCssUrl`    | `string \| string[]` | -        | 커스텀 CSS URL                 |
| `customJs`        | `string \| string[]` | -        | 커스텀 JS URL                  |
| `customJsStr`     | `string \| string[]` | -        | 커스텀 JS 인라인 코드          |
| `customfavIcon`   | `string`             | -        | 파비콘 URL                     |
| `customSiteTitle` | `string`             | -        | 브라우저 탭 제목               |
| `swaggerOptions`  | `SwaggerUiOptions`   | -        | Swagger UI 세부 옵션           |

`swaggerOptions` 기본값:

```typescript
{
  docExpansion: 'none',
  defaultModelsExpandDepth: -1,
  persistAuthorization: true,
  displayRequestDuration: true,
}
```

사용자가 전달한 값은 기본값에 병합됩니다.

## 인증 설정

각 scheme은 `{ options?: SecuritySchemeObject, name?: string }` 구조이며,
`options`는 `@nestjs/swagger`의 `SecuritySchemeObject`를 그대로 받습니다.
`boolean`을 전달하면 기본값으로 동작합니다.

### Bearer

```typescript
auth: {
  bearer: {
    name: 'Authentication',       // 기본값: 'bearer'
    options: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    },
  },
}
```

컨트롤러에 `@ApiBearerAuth()` 또는 `@ApiBearerAuth('Authentication')`을 적용합니다.

### Basic

```typescript
auth: {
  basic: {
    name: 'Secretkey',            // 기본값: 'basic'
    options: {
      type: 'http',
      scheme: 'basic',
      description: 'Enter secret key',
      in: 'header',
    },
  },
}
```

컨트롤러에 `@ApiBasicAuth()` 또는 `@ApiBasicAuth('Secretkey')`을 적용합니다.

### API Key

```typescript
auth: {
  apiKey: {
    name: 'api-key',              // 기본값: 'api-key'
    options: {
      type: 'apiKey',
      name: 'X-API-Key',
      in: 'header',
    },
  },
}
```

컨트롤러에 `@ApiSecurity('api-key')`을 적용합니다.

### OAuth2

```typescript
auth: {
  oauth2: {
    name: 'oauth2',
    options: {
      type: 'oauth2',
      flows: { ... },
    },
  },
}
```

### Cookie

```typescript
auth: {
  cookie: {
    cookieName: 'session',
    name: 'cookie',
    options: { ... },
  },
}
```

### Custom (addSecurity)

```typescript
auth: {
  custom: [
    {
      name: 'x-custom-auth',
      options: { type: 'apiKey', name: 'x-custom-auth', in: 'header' },
      requirements: ['read', 'write'],
    },
  ],
}
```

## forRootAsync

```typescript
SwaggerModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    title: 'Auth API',
    description: '인증 서비스',
    version: configService.get('app.version'),
    auth: { bearer: true },
  }),
  inject: [ConfigService],
});
```

## EKS 환경 서버 설정

```typescript
SwaggerModule.forRoot({
  title: 'Auth API',
  description: '인증 서비스',
  version: '1.0',
  servers: [
    { url: 'https://test.com/api/v1/auth', description: 'Production' },
    { url: 'http://localhost:3000', description: 'Local' },
  ],
});
```
