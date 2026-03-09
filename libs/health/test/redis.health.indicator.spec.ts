import { RedisHealthIndicator } from '../src/indicator/redis.health.indicator';

const createMockHealthIndicatorService = () => ({
  check: jest.fn().mockReturnValue({
    up: jest.fn().mockReturnValue({ redis: { status: 'up' } }),
    down: jest.fn().mockReturnValue({ redis: { status: 'down' } }),
  }),
});

const createMockRedisService = (pingResponse: string | Error) => ({
  getOrThrow: jest.fn().mockReturnValue({
    ping: jest.fn().mockImplementation(() => {
      if (pingResponse instanceof Error) throw pingResponse;
      return Promise.resolve(pingResponse);
    }),
  }),
});

const createThrowingRedisService = () => ({
  getOrThrow: jest.fn().mockImplementation(() => {
    throw new Error('Redis not available');
  }),
});

describe('RedisHealthIndicator', () => {
  describe('isHealthy', () => {
    it('should return up when ping responds with PONG', async () => {
      const mockService = createMockHealthIndicatorService();
      const mockRedisService = createMockRedisService('PONG');
      const indicator = new RedisHealthIndicator(mockService as any, mockRedisService as any);

      const result = await indicator.isHealthy();

      expect(result).toEqual({ redis: { status: 'up' } });
    });

    it('should return down when ping does not respond with PONG', async () => {
      const mockService = createMockHealthIndicatorService();
      const mockRedisService = createMockRedisService('ERROR');
      const indicator = new RedisHealthIndicator(mockService as any, mockRedisService as any);

      const result = await indicator.isHealthy();

      expect(result).toEqual({ redis: { status: 'down' } });
    });

    it('should return down when getOrThrow throws', async () => {
      const mockService = createMockHealthIndicatorService();
      const mockRedisService = createThrowingRedisService();
      const indicator = new RedisHealthIndicator(mockService as any, mockRedisService as any);

      const result = await indicator.isHealthy();

      expect(result).toEqual({ redis: { status: 'down' } });
    });
  });
});
