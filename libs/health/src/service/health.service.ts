import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { HealthCheckService } from '@nestjs/terminus';
import { HEALTH_INDICATORS, HealthIndicatorContract } from '../interfaces/health.interface';
import { TerminationService } from '../termination/termination.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly terminationService: TerminationService,
    @Inject(HEALTH_INDICATORS) private readonly indicators: HealthIndicatorContract[],
  ) {}

  liveness() {
    return { status: 'ok' };
  }

  async readiness() {
    if (this.terminationService.terminating) {
      throw new ServiceUnavailableException();
    }

    return this.healthCheckService.check(
      this.indicators.map((indicator) => () => indicator.isHealthy()),
    );
  }
}
