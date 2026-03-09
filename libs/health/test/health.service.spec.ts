import { HealthService } from '../src/service/health.service';
import { HealthIndicatorContract } from '../src/interfaces/health.interface';

const createMockHealthCheckService = () => ({
  check: jest.fn(),
});

const createMockIndicator = (result: Record<string, any>): HealthIndicatorContract => ({
  isHealthy: jest.fn().mockResolvedValue(result),
});

describe('HealthService', () => {
  describe('liveness', () => {
    it('should return status ok', () => {
      const service = new HealthService(createMockHealthCheckService() as any, []);

      expect(service.liveness()).toEqual({ status: 'ok' });
    });
  });

  describe('readiness', () => {
    it('should call healthCheckService.check with indicator functions', async () => {
      const mockHealthCheckService = createMockHealthCheckService();
      mockHealthCheckService.check.mockResolvedValue({ status: 'ok' });

      const indicator = createMockIndicator({ database: { status: 'up' } });
      const service = new HealthService(mockHealthCheckService as any, [indicator]);

      await service.readiness();

      expect(mockHealthCheckService.check).toHaveBeenCalledWith(
        expect.arrayContaining([expect.any(Function)]),
      );
    });

    it('should map each indicator to a function that calls isHealthy', async () => {
      const mockHealthCheckService = createMockHealthCheckService();
      mockHealthCheckService.check.mockImplementation(async (fns: (() => any)[]) => {
        for (const fn of fns) await fn();
      });

      const indicator = createMockIndicator({ database: { status: 'up' } });
      const service = new HealthService(mockHealthCheckService as any, [indicator]);

      await service.readiness();

      expect(indicator.isHealthy).toHaveBeenCalled();
    });
  });
});
