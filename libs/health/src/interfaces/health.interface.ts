import { Type } from '@nestjs/common';

export interface HealthIndicatorContract {
  isHealthy(): Promise<Record<string, any>>;
}

export interface HealthModuleOptions {
  readiness: Type<HealthIndicatorContract>[];
}

export const HEALTH_INDICATORS = 'HEALTH_INDICATORS';
