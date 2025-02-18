import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { ConfigModule } from '@libs/config';
import { LoggerModule } from '@libs/logger';

@Module({
  imports: [LoggerModule.forRoot(), ConfigModule.forRoot()],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
