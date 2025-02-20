import { Injectable } from '@nestjs/common';
import { HealthCheckService, HealthCheck, HealthIndicatorFunction } from '@nestjs/terminus';
import { DatabaseHealthIndicator } from '../indicator/database.health.indicator';
import { RedisHealthIndicator } from '../indicator/redis.health.indicator';

@Injectable()
export class HealthService {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly databaseIndicator: DatabaseHealthIndicator,
    private readonly redisIndicator: RedisHealthIndicator,
  ) {}

  @HealthCheck()
  async check() {
    const healthIndicators: HealthIndicatorFunction[] = [
      () => this.databaseIndicator.isHealthy(),
      () => this.redisIndicator.isHealthy(),
    ];

    return this.healthCheckService.check(healthIndicators);
  }
}
