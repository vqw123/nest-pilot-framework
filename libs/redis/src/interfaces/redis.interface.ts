import { Redis, RedisOptions } from 'ioredis';
import { ModuleMetadata } from '@nestjs/common';

export interface RedisClientOptions extends RedisOptions {
  namespace?: string;
  onClientReady?: (client: Redis) => void | Promise<void>;
}

export interface RedisModuleOptions {
  readyLog?: boolean;
  config: RedisClientOptions | RedisClientOptions[];
}

export interface RedisModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => RedisModuleOptions | Promise<RedisModuleOptions>;
  inject?: any[];
}
