import { RedisService } from '../src/service/redis.service';
import { DEFAULT_REDIS_NAMESPACE } from '../src/constants/redis.constants';
import { Redis } from 'ioredis';

const createMockClient = (status = 'ready') =>
  ({
    status,
    quit: jest.fn().mockResolvedValue('OK'),
  }) as unknown as Redis;

const createService = (clients: Map<string, Redis>) => {
  return new RedisService(clients);
};

describe('RedisService', () => {
  describe('getOrThrow', () => {
    it('should return default client when no namespace provided', () => {
      const client = createMockClient();
      const service = createService(new Map([[DEFAULT_REDIS_NAMESPACE, client]]));

      expect(service.getOrThrow()).toBe(client);
    });

    it('should return named client', () => {
      const client = createMockClient();
      const service = createService(new Map([['cache', client]]));

      expect(service.getOrThrow('cache')).toBe(client);
    });

    it('should throw when client not found', () => {
      const service = createService(new Map());

      expect(() => service.getOrThrow('missing')).toThrow(
        'Redis client "missing" not found',
      );
    });
  });

  describe('getOrNil', () => {
    it('should return default client when no namespace provided', () => {
      const client = createMockClient();
      const service = createService(new Map([[DEFAULT_REDIS_NAMESPACE, client]]));

      expect(service.getOrNil()).toBe(client);
    });

    it('should return named client', () => {
      const client = createMockClient();
      const service = createService(new Map([['session', client]]));

      expect(service.getOrNil('session')).toBe(client);
    });

    it('should return null when client not found', () => {
      const service = createService(new Map());

      expect(service.getOrNil('missing')).toBeNull();
    });
  });

  describe('onModuleDestroy', () => {
    it('should quit all active clients', async () => {
      const client1 = createMockClient('ready');
      const client2 = createMockClient('ready');
      const service = createService(
        new Map([
          ['default', client1],
          ['cache', client2],
        ]),
      );

      await service.onModuleDestroy();

      expect(client1.quit).toHaveBeenCalled();
      expect(client2.quit).toHaveBeenCalled();
    });

    it('should skip already disconnected clients', async () => {
      const activeClient = createMockClient('ready');
      const closedClient = createMockClient('end');
      const service = createService(
        new Map([
          ['default', activeClient],
          ['cache', closedClient],
        ]),
      );

      await service.onModuleDestroy();

      expect(activeClient.quit).toHaveBeenCalled();
      expect(closedClient.quit).not.toHaveBeenCalled();
    });
  });
});
