import { DynamicModule, Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthService } from './service/health.service';
import { HealthController } from './controller/health.v1.controller';
import { HEALTH_INDICATORS, HealthModuleOptions } from './interfaces/health.interface';

@Module({})
export class HealthModule {
  static forRoot(options: HealthModuleOptions): DynamicModule {
    return {
      module: HealthModule,
      imports: [TerminusModule],
      controllers: [HealthController],
      providers: [
        ...options.readiness,
        {
          provide: HEALTH_INDICATORS,
          useFactory: (...indicators) => indicators,
          inject: options.readiness,
        },
        HealthService,
      ],
    };
  }
}
