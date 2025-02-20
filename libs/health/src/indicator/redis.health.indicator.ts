import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { RedisService } from '@libs/redis';
import { Redis } from 'ioredis';

@Injectable()
export class RedisHealthIndicator {
  private readonly redis: Redis | null;

  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getOrNil();
  }

  async isHealthy(): Promise<Record<string, any>> {
    if (!this.redis) {
      return this.healthIndicatorService
        .check('redis')
        .down({ message: 'Redis instance not available' });
    }

    try {
      const pingResponse = await this.redis.ping();
      const isRedisUp = pingResponse === 'PONG';

      if (isRedisUp) {
        return this.healthIndicatorService.check('redis').up();
      } else {
        return this.healthIndicatorService.check('redis').down({ message: 'Redis ping failed' });
      }
    } catch (error) {
      return this.healthIndicatorService.check('redis').down({
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
