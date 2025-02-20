import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { ConfigModule } from '@libs/config';
import { LoggerModule } from '@libs/logger';
import { DatabaseModule } from 'libs/database/src';
import { RedisModule } from '@libs/redis';

@Module({
  imports: [
    LoggerModule.forRoot(),
    ConfigModule.forRoot(),
    DatabaseModule.forRoot('default', []),
    RedisModule.forRoot('default'),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
