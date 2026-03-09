import { DynamicModule, Module, Provider } from '@nestjs/common';
import { RedisModuleOptions, RedisModuleAsyncOptions } from './interfaces/redis.interface';
import { REDIS_CLIENTS, REDIS_MODULE_OPTIONS } from './constants/redis.constants';
import { createRedisClients } from './providers/redis.providers';
import { RedisService } from './service/redis.service';

@Module({})
export class RedisModule {
  static forRoot(options: RedisModuleOptions): DynamicModule {
    const providers: Provider[] = [
      {
        provide: REDIS_CLIENTS,
        useFactory: () => createRedisClients(options),
      },
      RedisService,
    ];

    return {
      global: true,
      module: RedisModule,
      providers,
      exports: [RedisService],
    };
  }

  static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
    const providers: Provider[] = [
      {
        provide: REDIS_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject ?? [],
      },
      {
        provide: REDIS_CLIENTS,
        useFactory: (moduleOptions: RedisModuleOptions) => createRedisClients(moduleOptions),
        inject: [REDIS_MODULE_OPTIONS],
      },
      RedisService,
    ];

    return {
      global: true,
      module: RedisModule,
      imports: options.imports ?? [],
      providers,
      exports: [RedisService],
    };
  }
}
