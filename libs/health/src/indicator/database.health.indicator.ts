import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly dataSource: DataSource,
  ) {}

  async isHealthy(): Promise<Record<string, any>> {
    try {
      await this.dataSource.query('SELECT 1'); // ✅ 간단한 쿼리 실행하여 DB 체크
      return this.healthIndicatorService.check('database').up(); // ✅ 최신 방식 적용
    } catch (error) {
      return this.healthIndicatorService
        .check('database')
        .down({ message: 'Database connection failed' });
    }
  }
}
