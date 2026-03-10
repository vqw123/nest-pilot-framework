import { Module } from '@nestjs/common';
import { LoggerModule } from '@libs/logger';
import { ConfigModule, ConfigService } from '@libs/config';
import { DatabaseModule } from '@libs/database';
import { RedisModule } from '@libs/redis';
import { ErrorModule } from '@libs/error';
import { DatabaseHealthIndicator, HealthModule, RedisHealthIndicator } from '@libs/health';
import { ValidationModule, SecurityModule } from '@libs/http';
import { SwaggerModule } from '@libs/swagger';
import { ExampleController } from './example.controller';
import { ExampleService } from './example.service';
import { ExampleEntity } from './entity/example.entity';

/**
 * Example 앱의 루트 모듈.
 * 공용 라이브러리를 조합해 실제 서비스에서의 사용 패턴을 보여준다.
 *
 * - LoggerModule: HTTP 인터셉터 포함 구조화 로깅
 * - ConfigModule: 환경별 YAML 설정 로드
 * - ErrorModule: 전역 예외 필터 (BaseHttpException → 일관된 에러 응답)
 * - DatabaseModule: TypeORM MySQL master/slave 연결
 * - RedisModule: ioredis 기반 캐시 클라이언트
 * - HealthModule: /health/live, /health/ready 엔드포인트
 * - ValidationModule: class-validator 기반 전역 ValidationPipe
 * - SecurityModule: Helmet, CORS 설정
 * - SwaggerModule: Swagger UI 문서화
 */
@Module({
  imports: [
    LoggerModule.forRootAsync({
      useFactory: () => ({ enableHttpInterceptor: true }),
    }),
    ConfigModule.forRoot({ appName: 'example' }),
    ErrorModule.forRoot(),
    DatabaseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
      }),
      inject: [ConfigService],
    }),
    DatabaseModule.forFeature([ExampleEntity]),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => configService.get('redis'),
      inject: [ConfigService],
    }),
    HealthModule.forRoot({
      readiness: [DatabaseHealthIndicator, RedisHealthIndicator],
    }),
    ValidationModule.forRoot({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
    SecurityModule.forRoot({
      helmet: {},
      cors: { origin: '*' },
    }),
    SwaggerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        title: 'Example API',
        description: '라이브러리 사용 예제 API',
        version: configService.get('app.version'),
        path: 'docs',
        auth: { bearer: true },
        servers: [{ url: 'http://localhost:3000', description: 'Local' }],
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ExampleController],
  providers: [ExampleService],
})
export class ExampleModule {}
