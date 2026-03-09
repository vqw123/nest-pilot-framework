import { DatabaseHealthIndicator } from '../src/indicator/database.health.indicator';

const createMockHealthIndicatorService = () => ({
  check: jest.fn().mockReturnValue({
    up: jest.fn().mockReturnValue({ database: { status: 'up' } }),
    down: jest.fn().mockReturnValue({ database: { status: 'down' } }),
  }),
});

const createMockDataSource = (shouldThrow = false) => ({
  query: jest.fn().mockImplementation(() => {
    if (shouldThrow) throw new Error('Connection refused');
    return Promise.resolve([{ '?column?': 1 }]);
  }),
});

describe('DatabaseHealthIndicator', () => {
  describe('isHealthy', () => {
    it('should return up when SELECT 1 succeeds', async () => {
      const mockService = createMockHealthIndicatorService();
      const mockDataSource = createMockDataSource();
      const indicator = new DatabaseHealthIndicator(mockService as any, mockDataSource as any);

      const result = await indicator.isHealthy();

      expect(mockDataSource.query).toHaveBeenCalledWith('SELECT 1');
      expect(mockService.check('database').up).toBeDefined();
      expect(result).toEqual({ database: { status: 'up' } });
    });

    it('should return down when SELECT 1 throws', async () => {
      const mockService = createMockHealthIndicatorService();
      const mockDataSource = createMockDataSource(true);
      const indicator = new DatabaseHealthIndicator(mockService as any, mockDataSource as any);

      const result = await indicator.isHealthy();

      expect(result).toEqual({ database: { status: 'down' } });
    });
  });
});
