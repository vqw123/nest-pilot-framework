import { ServiceUnavailableException } from '@nestjs/common';
import { HealthService } from '../src/service/health.service';
import { HealthIndicatorContract } from '../src/interfaces/health.interface';
import { TerminationService } from '../src/termination/termination.service';

const createMockHealthCheckService = () => ({
  check: jest.fn(),
});

const createMockIndicator = (result: Record<string, any>): HealthIndicatorContract => ({
  isHealthy: jest.fn().mockResolvedValue(result),
});

const createTerminationService = (terminating: boolean) =>
  ({ terminating }) as TerminationService;

describe('HealthService', () => {
  describe('liveness', () => {
    it('should return status ok', () => {
      const service = new HealthService(
        createMockHealthCheckService() as any,
        createTerminationService(false),
        [],
      );

      expect(service.liveness()).toEqual({ status: 'ok' });
    });
  });

  describe('readiness', () => {
    it('should throw ServiceUnavailableException when terminating', async () => {
      const service = new HealthService(
        createMockHealthCheckService() as any,
        createTerminationService(true),
        [],
      );

      await expect(service.readiness()).rejects.toThrow(ServiceUnavailableException);
    });

    it('should call healthCheckService.check with indicator functions', async () => {
      const mockHealthCheckService = createMockHealthCheckService();
      mockHealthCheckService.check.mockResolvedValue({ status: 'ok' });

      const indicator = createMockIndicator({ database: { status: 'up' } });
      const service = new HealthService(
        mockHealthCheckService as any,
        createTerminationService(false),
        [indicator],
      );

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
      const service = new HealthService(
        mockHealthCheckService as any,
        createTerminationService(false),
        [indicator],
      );

      await service.readiness();

      expect(indicator.isHealthy).toHaveBeenCalled();
    });
  });
});
