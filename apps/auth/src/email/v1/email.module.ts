import { Module } from '@nestjs/common';
import { DatabaseModule } from '@libs/database';
import { TokenModule } from '../../token/v1/token.module';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { EmailIdentityEntity } from '../../entity/email-identity.entity';
import { AccountEntity } from '../../entity/account.entity';
import { ProjectEntity } from '../../entity/project.entity';

@Module({
  imports: [
    TokenModule,
    DatabaseModule.forFeature([EmailIdentityEntity, AccountEntity, ProjectEntity]),
  ],
  controllers: [EmailController],
  providers: [EmailService],
})
export class EmailModule {}
