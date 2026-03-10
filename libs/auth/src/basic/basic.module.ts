import { DynamicModule, Module } from '@nestjs/common';
import { BASIC_MODULE_OPTIONS, BasicGuard } from './basic.guard';
import { BasicModuleOptions } from './basic-module-options.interface';

export interface BasicModuleAsyncOptions {
  imports?: any[];
  useFactory: (...args: any[]) => BasicModuleOptions | Promise<BasicModuleOptions>;
  inject?: any[];
}

/**
 * Basic Auth 모듈.
 * validate 함수를 주입해 인증 로직을 커스터마이징한다.
 *
 * @example
 * BasicModule.forRootAsync({
 *   useFactory: (keyService: ApiKeyService) => ({
 *     validate: (username, password) => keyService.verify(username, password),
 *   }),
 *   inject: [ApiKeyService],
 * })
 */
@Module({})
export class BasicModule {
  static forRootAsync(options: BasicModuleAsyncOptions): DynamicModule {
    return {
      module: BasicModule,
      global: true,
      imports: options.imports ?? [],
      providers: [
        {
          provide: BASIC_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject ?? [],
        },
        BasicGuard,
      ],
      exports: [BasicGuard],
    };
  }
}
