import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@libs/config';
import Redis, { RedisOptions } from 'ioredis';
import { RedisService } from './service/redis.service';

@Module({})
export class RedisModule {
  static forRoot(redisKey: string = 'default'): DynamicModule {
    return {
      module: RedisModule,
      providers: [
        {
          provide: 'REDIS_CLIENT',
          useFactory: (configService: ConfigService) => {
            const redisConfig = configService.get<RedisOptions>(`redis.${redisKey}`);
            if (!redisConfig) {
              throw new Error(`Redis configuration for '${redisKey}' not found`);
            }
            return new Redis(redisConfig); //ioredis 인스턴스 생성
          },
          inject: [ConfigService],
        },
        RedisService, //RedisService를 주입 가능하게 설정
      ],
      exports: ['REDIS_CLIENT', RedisService], //다른 모듈에서 Redis 사용 가능하도록 export
    };
  }
}
