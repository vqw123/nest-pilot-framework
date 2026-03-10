import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '@libs/database';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { WellKnownController } from './well-known.controller';
import { ProjectEntity } from '../../entity/project.entity';

@Module({
  imports: [
    JwtModule.register({}),
    DatabaseModule.forFeature([ProjectEntity]),
  ],
  controllers: [TokenController, WellKnownController],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
