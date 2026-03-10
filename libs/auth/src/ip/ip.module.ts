import { DynamicModule, Module } from '@nestjs/common';
import { IP_MODULE_OPTIONS, IpGuard } from './ip.guard';
import { IpModuleOptions } from './ip-module-options.interface';

export interface IpModuleAsyncOptions {
  imports?: any[];
  useFactory: (...args: any[]) => IpModuleOptions | Promise<IpModuleOptions>;
  inject?: any[];
}

/**
 * IP 화이트리스트/블랙리스트 모듈.
 *
 * @example
 * IpModule.forRootAsync({
 *   useFactory: (config: ConfigService) => ({
 *     whitelist: config.get('security.ipWhitelist'), // ['10.0.0.0/8']
 *   }),
 *   inject: [ConfigService],
 * })
 */
@Module({})
export class IpModule {
  static forRootAsync(options: IpModuleAsyncOptions): DynamicModule {
    return {
      module: IpModule,
      global: true,
      imports: options.imports ?? [],
      providers: [
        {
          provide: IP_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject ?? [],
        },
        IpGuard,
      ],
      exports: [IpGuard],
    };
  }
}
