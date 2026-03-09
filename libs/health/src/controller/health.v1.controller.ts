import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { HealthCheck } from '@nestjs/terminus';
import { HealthService } from '../service/health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('liveness')
  liveness() {
    return this.healthService.liveness();
  }

  @Get('readiness')
  @HealthCheck()
  async readiness() {
    try {
      return await this.healthService.readiness();
    } catch {
      throw new ServiceUnavailableException();
    }
  }
}
