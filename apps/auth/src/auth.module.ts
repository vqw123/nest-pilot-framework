import { Module } from '@nestjs/common';
import { LoggerModule } from '@libs/logger';
import { ConfigModule, ConfigService } from '@libs/config';
import { DatabaseModule } from '@libs/database';
import { ErrorModule } from '@libs/error';
import { ValidationModule } from '@libs/http';
import { SwaggerModule } from '@libs/swagger';
import { BearerModule } from '@libs/auth';
import { RedisModule } from '@libs/redis';
import { TokenModule } from './token/v1/token.module';
import { SessionModule } from './session/v1/session.module';
import { SigninModule } from './signin/v1/signin.module';
import { SignupModule } from './signup/v1/signup.module';
import { EmailModule } from './email/v1/email.module';
import { LinkModule } from './link/v1/link.module';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      useFactory: () => ({ enableHttpInterceptor: true }),
    }),
    ConfigModule.forRoot({ appName: 'auth' }),
    ErrorModule.forRoot(),
    DatabaseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
      }),
      inject: [ConfigService],
    }),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        config: configService.get('redis.config'),
      }),
      inject: [ConfigService],
    }),
    ValidationModule.forRoot({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
    SwaggerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        title: 'Auth Server API',
        description: '사내 통합 인증 서버 (Internal SSO Platform) API',
        version: configService.get('app.version'),
        path: 'docs',
        auth: { bearer: true },
        servers: [{ url: 'http://localhost:3001', description: 'Local' }],
      }),
      inject: [ConfigService],
    }),
    BearerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        publicKey: configService.get<string>('jwt.publicKey'),
        issuer: configService.get<string>('jwt.issuer'),
      }),
      inject: [ConfigService],
    }),
    TokenModule,
    SessionModule,
    SigninModule,
    SignupModule,
    EmailModule,
    LinkModule,
  ],
})
export class AuthModule {}
