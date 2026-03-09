import { Inject, Injectable } from '@nestjs/common';
import { HealthCheckService } from '@nestjs/terminus';
import { HEALTH_INDICATORS, HealthIndicatorContract } from '../interfaces/health.interface';

@Injectable()
export class HealthService {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    @Inject(HEALTH_INDICATORS) private readonly indicators: HealthIndicatorContract[],
  ) {}

  liveness() {
    return { status: 'ok' };
  }

  async readiness() {
    return this.healthCheckService.check(
      this.indicators.map((indicator) => () => indicator.isHealthy()),
    );
  }
}
