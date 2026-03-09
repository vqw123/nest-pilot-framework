import { TerminusModule } from '@nestjs/terminus';
import { HealthModule } from '../src/health.module';
import { HEALTH_INDICATORS } from '../src/interfaces/health.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
class StubIndicator {
  async isHealthy() {
    return { stub: { status: 'up' } };
  }
}

describe('HealthModule', () => {
  describe('forRoot', () => {
    it('should return a DynamicModule with TerminusModule', () => {
      const result = HealthModule.forRoot({ readiness: [] });

      expect(result.module).toBe(HealthModule);
      expect(result.imports).toContain(TerminusModule);
    });

    it('should not be global', () => {
      const result = HealthModule.forRoot({ readiness: [] });

      expect(result.global).toBeUndefined();
    });

    it('should register indicator classes as providers', () => {
      const result = HealthModule.forRoot({ readiness: [StubIndicator] });

      expect(result.providers).toContain(StubIndicator);
    });

    it('should register HEALTH_INDICATORS token provider', () => {
      const result = HealthModule.forRoot({ readiness: [StubIndicator] });

      const tokenProvider = (result.providers as any[]).find(
        (p) => p.provide === HEALTH_INDICATORS,
      );
      expect(tokenProvider).toBeDefined();
      expect(tokenProvider.inject).toContain(StubIndicator);
    });
  });
});
