import { Module } from '@nestjs/common';
import { ExampleService } from './service/example.service';
import { ExampleController } from './controller/example.controller';
import { LoggerModule } from '@libs/logger';
import { ConfigModule } from '@libs/config';
import { DatabaseModule } from '@libs/database';
import { RedisModule } from '@libs/redis';
import { HealthModule } from '@libs/health';

@Module({
  imports: [
    LoggerModule.forRoot({
      enableHttpInterceptor: true,
    }),
    ConfigModule.forRoot({
      appName: 'example',
    }),
    DatabaseModule.forRoot(),
    RedisModule.forRoot(),
    HealthModule,
  ],
  controllers: [ExampleController],
  providers: [ExampleService],
})
export class ExampleModule {}
