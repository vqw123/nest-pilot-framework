import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { RedisService } from '@libs/redis';
import { HealthIndicatorContract } from '../interfaces/health.interface';

@Injectable()
export class RedisHealthIndicator implements HealthIndicatorContract {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly redisService: RedisService,
  ) {}

  async isHealthy(): Promise<Record<string, any>> {
    try {
      const redis = this.redisService.getOrThrow();
      const pingResponse = await redis.ping();

      if (pingResponse === 'PONG') {
        return this.healthIndicatorService.check('redis').up();
      }

      return this.healthIndicatorService.check('redis').down({ message: 'Redis ping failed' });
    } catch {
      return this.healthIndicatorService.check('redis').down({ message: 'Redis not available' });
    }
  }
}
