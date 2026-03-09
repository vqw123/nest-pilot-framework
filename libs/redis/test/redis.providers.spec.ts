import { createRedisClients } from '../src/providers/redis.providers';
import { DEFAULT_REDIS_NAMESPACE } from '../src/constants/redis.constants';

jest.mock('ioredis', () => {
  return {
    Redis: jest.fn().mockImplementation(() => ({
      status: 'ready',
      on: jest.fn(),
      quit: jest.fn(),
    })),
  };
});

describe('createRedisClients', () => {
  it('should create a single default client', () => {
    const clients = createRedisClients({
      config: { host: 'localhost', port: 6379 },
    });

    expect(clients.size).toBe(1);
    expect(clients.has(DEFAULT_REDIS_NAMESPACE)).toBe(true);
  });

  it('should create multiple named clients', () => {
    const clients = createRedisClients({
      config: [
        { namespace: 'cache', host: 'localhost', port: 6379 },
        { namespace: 'session', host: 'localhost', port: 6380 },
      ],
    });

    expect(clients.size).toBe(2);
    expect(clients.has('cache')).toBe(true);
    expect(clients.has('session')).toBe(true);
  });

  it('should throw on empty config array', () => {
    expect(() =>
      createRedisClients({ config: [] }),
    ).toThrow('Redis config must have at least one client');
  });

  it('should throw on duplicate namespace', () => {
    expect(() =>
      createRedisClients({
        config: [
          { namespace: 'cache', host: 'localhost', port: 6379 },
          { namespace: 'cache', host: 'localhost', port: 6380 },
        ],
      }),
    ).toThrow('Redis client with namespace "cache" already exists');
  });

  it('should register ready event listener when readyLog is true', () => {
    const clients = createRedisClients({
      readyLog: true,
      config: { host: 'localhost', port: 6379 },
    });

    const client = clients.get(DEFAULT_REDIS_NAMESPACE)!;
    expect(client.on).toHaveBeenCalledWith('ready', expect.any(Function));
  });

  it('should register ready event listener when onClientReady is provided', () => {
    const onClientReady = jest.fn();
    const clients = createRedisClients({
      config: { host: 'localhost', port: 6379, onClientReady },
    });

    const client = clients.get(DEFAULT_REDIS_NAMESPACE)!;
    expect(client.on).toHaveBeenCalledWith('ready', expect.any(Function));
  });

  it('should not register ready event listener when neither readyLog nor onClientReady', () => {
    const clients = createRedisClients({
      config: { host: 'localhost', port: 6379 },
    });

    const client = clients.get(DEFAULT_REDIS_NAMESPACE)!;
    expect(client.on).not.toHaveBeenCalled();
  });
});
