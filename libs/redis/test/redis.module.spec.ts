import { Test, TestingModule } from '@nestjs/testing';
import { RedisModule } from '../src/redis.module';
import { RedisService } from '../src/service/redis.service';

jest.mock('ioredis', () => {
  return {
    Redis: jest.fn().mockImplementation(() => ({
      status: 'ready',
      on: jest.fn(),
      quit: jest.fn().mockResolvedValue('OK'),
    })),
  };
});

describe('RedisModule', () => {
  let module: TestingModule;

  afterEach(async () => {
    await module?.close();
  });

  it('should compile with forRoot (single connection)', async () => {
    module = await Test.createTestingModule({
      imports: [
        RedisModule.forRoot({
          config: { host: 'localhost', port: 6379 },
        }),
      ],
    }).compile();

    const service = module.get(RedisService);
    expect(service).toBeInstanceOf(RedisService);
  });

  it('should compile with forRoot (multiple connections)', async () => {
    module = await Test.createTestingModule({
      imports: [
        RedisModule.forRoot({
          config: [
            { namespace: 'cache', host: 'localhost', port: 6379 },
            { namespace: 'session', host: 'localhost', port: 6380 },
          ],
        }),
      ],
    }).compile();

    const service = module.get(RedisService);
    expect(service.getOrThrow('cache')).toBeDefined();
    expect(service.getOrThrow('session')).toBeDefined();
  });

  it('should compile with forRootAsync', async () => {
    module = await Test.createTestingModule({
      imports: [
        RedisModule.forRootAsync({
          useFactory: () => ({
            config: { host: 'localhost', port: 6379 },
          }),
        }),
      ],
    }).compile();

    const service = module.get(RedisService);
    expect(service).toBeInstanceOf(RedisService);
  });
});
