import { DynamicModule, Module, Logger, Provider } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as Transport from 'winston-transport';
import { LoggerModuleAsyncOptions, LoggerModuleOptions } from './interfaces/logger.interface';
import { createDefaultTransport } from './transports/logger.transports';
import {
  createHttpInterceptorProvidersAsync,
  createAsyncLoggerProvider,
  createAsyncOptionsProvider,
  createHttpInterceptorProviders,
} from './providers/logger.providers';

@Module({})
export class LoggerModule {
  static forRoot(options: LoggerModuleOptions, isGlobal: boolean = true): DynamicModule {
    const transports: Transport[] = [createDefaultTransport(), ...(options.transports ?? [])];

    const winstonLogger = WinstonModule.createLogger({
      transports,
    });

    const providers: Provider[] = [
      {
        provide: Logger,
        useValue: winstonLogger,
      },
      ...(createHttpInterceptorProviders(options) ?? []),
    ];

    Logger.overrideLogger(winstonLogger); // NestJS Logger를 winston으로 교체

    return {
      global: isGlobal,
      module: LoggerModule,
      providers,
      exports: [Logger], // 다른 모듈에서 사용할 수 있도록 export
    };
  }

  static forRootAsync(options: LoggerModuleAsyncOptions, isGlobal: boolean = true): DynamicModule {
    const providers: Provider[] = [
      createAsyncOptionsProvider(options),
      createAsyncLoggerProvider(),
      ...createHttpInterceptorProvidersAsync(),
      ...(options.extraProviders ?? []),
    ];

    return {
      global: isGlobal,
      module: LoggerModule,
      imports: options.imports ?? [],
      providers,
      exports: [Logger],
    };
  }
}
