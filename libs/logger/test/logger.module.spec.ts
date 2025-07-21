import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import * as winston from 'winston';
import { LoggerModule } from '../src/logger.module';
import { LoggerModuleOptions } from '../src/interfaces/logger.interface';

import { HttpLoggerInterceptor } from '../src/interceptor/http.logger.interceptor';

describe('LoggerModule', () => {
  let module: TestingModule;

  afterEach(async () => {
    await module?.close();
  });

  it('should create logger with forRoot() using default transport', async () => {
    module = await Test.createTestingModule({
      imports: [LoggerModule.forRoot({})],
    }).compile();

    const logger = module.get<Logger>(Logger);

    expect(logger).toBeDefined();
    expect(logger.log).toBeDefined();
    // 로그 호출 테스트 (throw 안 나는지만 검증)
    expect(() => logger.log('Test log')).not.toThrow();
  });

  it('should create logger with forRootAsync() using injected options', async () => {
    const mockTransport = new winston.transports.Console({ level: 'warn' });

    const mockFactory = jest.fn().mockResolvedValue({
      transports: [mockTransport],
    });

    module = await Test.createTestingModule({
      imports: [
        LoggerModule.forRootAsync({
          useFactory: mockFactory,
          inject: [],
        }),
      ],
    }).compile();

    const logger = module.get<Logger>(Logger);

    expect(logger).toBeDefined();
    expect(mockFactory).toHaveBeenCalled();
    expect(() => logger.warn('Warn level log')).not.toThrow();
  });

  it('should override NestJS Logger globally', async () => {
    const overrideSpy = jest.spyOn(Logger, 'overrideLogger');

    module = await Test.createTestingModule({
      imports: [LoggerModule.forRoot({})],
    }).compile();

    expect(overrideSpy).toHaveBeenCalled();
  });

  it('should export Winston logger as Logger token', async () => {
    module = await Test.createTestingModule({
      imports: [LoggerModule.forRoot({})],
    }).compile();

    const logger = module.get(Logger);

    // 최소한 logger 역할을 하는 객체인지 확인
    expect(typeof logger.log).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('should handle missing transports gracefully', async () => {
    module = await Test.createTestingModule({
      imports: [
        LoggerModule.forRootAsync({
          useFactory: async (): Promise<LoggerModuleOptions> => ({ transports: undefined }),
          inject: [],
        }),
      ],
    }).compile();

    const logger = module.get(Logger);
    expect(() => logger.log('fallback log')).not.toThrow();
  });

  it('should register HttpLoggerInterceptor when enabled', async () => {
    module = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot({
          enableHttpInterceptor: true,
        }),
      ],
    }).compile();

    const interceptor = module.get<HttpLoggerInterceptor>(HttpLoggerInterceptor);
    expect(interceptor).toBeInstanceOf(HttpLoggerInterceptor);
  });
});
