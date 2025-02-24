import { ConfigService } from '@libs/config';
import { RedisService } from '@libs/redis';
import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class ExampleService {
  private readonly logger = new Logger(ExampleService.name);

  private readonly redis: Redis;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getOrThrow();
    const options = this.configService.get('database');
    options;
    this.logger.log('AuthService');
    this.test();
  }

  async test(): Promise<void> {
    await this.redis.set('aaa', 'sss');

    const data = await this.redis.get('aaa');
    this.logger.log(data);
    this.logger.log({
      a: 1,
      b: 2,
    });
  }

  getHello(): string {
    this.logger.warn('asdfadsfasd');
    const e: null | { a: string; name: string } = null;
    this.logger.log(e.name);

    return 'Hello World!';
  }
}
