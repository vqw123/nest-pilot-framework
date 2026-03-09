import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_CLIENTS, DEFAULT_REDIS_NAMESPACE } from '../constants/redis.constants';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(@Inject(REDIS_CLIENTS) private readonly clients: Map<string, Redis>) {}

  getOrThrow(namespace: string = DEFAULT_REDIS_NAMESPACE): Redis {
    const client = this.clients.get(namespace);
    if (!client) {
      throw new Error(`Redis client "${namespace}" not found`);
    }
    return client;
  }

  getOrNil(namespace: string = DEFAULT_REDIS_NAMESPACE): Redis | null {
    return this.clients.get(namespace) ?? null;
  }

  async onModuleDestroy(): Promise<void> {
    for (const client of this.clients.values()) {
      if (client.status !== 'end') {
        await client.quit();
      }
    }
  }
}
