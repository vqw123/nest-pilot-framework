import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthService } from './service/health.service';
import { HealthController } from './controller/health.v1.controller';
import { RedisHealthIndicator } from './indicator/redis.health.indicator';
import { DatabaseHealthIndicator } from './indicator/database.health.indicator';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [HealthService, DatabaseHealthIndicator, RedisHealthIndicator],
})
export class HealthModule {}
