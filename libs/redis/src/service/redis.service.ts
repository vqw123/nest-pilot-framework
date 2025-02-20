import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  getOrThrow(): Redis {
    if (!this.redisClient) {
      throw new Error('Redis client is not available');
    }
    return this.redisClient;
  }

  getOrNil(): Redis | null {
    return this.redisClient || null;
  }
}
