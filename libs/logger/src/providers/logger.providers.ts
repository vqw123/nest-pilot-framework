import { Logger, Provider } from '@nestjs/common';
import { LOGGER_MODULE_OPTIONS } from '../constants/logger.constants';
import { LoggerModuleAsyncOptions, LoggerModuleOptions } from '../interfaces/logger.interface';
import { createDefaultTransport } from '../transports/logger.transports';
import { WinstonModule } from 'nest-winston';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HttpLoggerInterceptor } from '../interceptor/http.logger.interceptor';

export const createAsyncOptionsProvider = (options: LoggerModuleAsyncOptions): Provider => {
  return {
    provide: LOGGER_MODULE_OPTIONS,
    useFactory: options.useFactory,
    inject: options.inject || [],
  };
};

export const createAsyncLoggerProvider = (): Provider => {
  return {
    provide: Logger,
    useFactory: (options: LoggerModuleOptions) => {
      const transports = [createDefaultTransport(), ...(options.transports ?? [])];

      const winstonLogger = WinstonModule.createLogger({
        transports,
      });

      Logger.overrideLogger(winstonLogger); // NestJS Logger를 winston으로 교체

      return winstonLogger;
    },
    inject: [LOGGER_MODULE_OPTIONS],
  };
};

export const createHttpInterceptorProvidersAsync = (): Provider[] => {
  return [
    HttpLoggerInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useFactory: (options: LoggerModuleOptions, interceptor: HttpLoggerInterceptor) => {
        if (options?.enableHttpInterceptor) {
          return interceptor;
        }
        return null;
      },
      inject: [LOGGER_MODULE_OPTIONS, HttpLoggerInterceptor],
    },
  ];
};

export const createHttpInterceptorProviders = (options: LoggerModuleOptions): Provider[] => {
  const providers: Provider[] = [HttpLoggerInterceptor];

  if (options?.enableHttpInterceptor) {
    providers.push({
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggerInterceptor,
    });
  }

  return providers;
};
