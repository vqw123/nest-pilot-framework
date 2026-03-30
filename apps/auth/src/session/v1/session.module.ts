import { Module } from '@nestjs/common';
import { TokenModule } from '../../token/v1/token.module';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';

@Module({
  imports: [TokenModule],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
