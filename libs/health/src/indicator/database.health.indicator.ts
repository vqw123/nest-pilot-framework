import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { DataSource } from '@libs/database';
import { HealthIndicatorContract } from '../interfaces/health.interface';

@Injectable()
export class DatabaseHealthIndicator implements HealthIndicatorContract {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly dataSource: DataSource,
  ) {}

  async isHealthy(): Promise<Record<string, any>> {
    try {
      await this.dataSource.query('SELECT 1');
      return this.healthIndicatorService.check('database').up();
    } catch {
      return this.healthIndicatorService
        .check('database')
        .down({ message: 'Database connection failed' });
    }
  }
}
