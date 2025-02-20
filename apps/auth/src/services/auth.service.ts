import { ConfigService } from '@libs/config';
import { RedisService } from '@libs/redis';
import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

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
  }

  getHello(): string {
    return 'Hello World!';
  }
}
3;
