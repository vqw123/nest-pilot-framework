import {
  DynamicModule,
  Inject,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import helmet, { HelmetOptions } from 'helmet';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export interface SecurityModuleOptions {
  helmet?: HelmetOptions;
  cors?: CorsOptions;
}

const SECURITY_MODULE_OPTIONS = 'SECURITY_MODULE_OPTIONS';

@Module({})
export class SecurityModule implements NestModule, OnModuleInit {
  static forRoot(options: SecurityModuleOptions = {}): DynamicModule {
    return {
      global: true,
      module: SecurityModule,
      providers: [{ provide: SECURITY_MODULE_OPTIONS, useValue: options }],
    };
  }

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    @Inject(SECURITY_MODULE_OPTIONS) private readonly options: SecurityModuleOptions,
  ) {}

  onModuleInit() {
    if (this.options.cors) {
      this.httpAdapterHost.httpAdapter.enableCors(this.options.cors);
    }
  }

  configure(consumer: MiddlewareConsumer) {
    if (this.options.helmet) {
      consumer.apply(helmet(this.options.helmet)).forRoutes('*');
    }
  }
}
