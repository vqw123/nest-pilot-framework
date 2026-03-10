import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { BEARER_MODULE_OPTIONS, BearerStrategy } from './bearer.strategy';
import { BearerGuard } from './bearer.guard';
import { BearerModuleOptions } from './bearer-module-options.interface';

export interface BearerModuleAsyncOptions {
  imports?: any[];
  useFactory: (...args: any[]) => BearerModuleOptions | Promise<BearerModuleOptions>;
  inject?: any[];
}

/**
 * Bearer JWT 인증 모듈.
 *
 * 로컬/개발: publicKey(base64 PEM)로 정적 검증.
 * 스테이징/운영: jwksUri로 auth 서버 또는 CDN JWKS endpoint에서 공개키 동적 fetch.
 *
 * @example
 * BearerModule.forRootAsync({
 *   useFactory: (config: ConfigService) => ({
 *     jwksUri: config.get('auth.jwksUri'),   // 운영: auth 서버 또는 CDN URL
 *     // publicKey: config.get('jwt.publicKey'), // 로컬: base64 PEM
 *     issuer: config.get('auth.issuer'),
 *   }),
 *   inject: [ConfigService],
 * })
 */
@Module({})
export class BearerModule {
  static forRootAsync(options: BearerModuleAsyncOptions): DynamicModule {
    return {
      module: BearerModule,
      global: true,
      imports: [PassportModule, ...(options.imports ?? [])],
      providers: [
        {
          provide: BEARER_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject ?? [],
        },
        BearerStrategy,
        BearerGuard,
      ],
      exports: [BearerGuard],
    };
  }
}
