import { Module } from '@nestjs/common';
import { DatabaseModule } from '@libs/database';
import { SessionModule } from '../../session/v1/session.module';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { EmailIdentityEntity } from '../../entity/email-identity.entity';
import { AccountEntity } from '../../entity/account.entity';
import { ProjectEntity } from '../../entity/project.entity';

@Module({
  imports: [
    SessionModule,
    DatabaseModule.forFeature([EmailIdentityEntity, AccountEntity, ProjectEntity]),
  ],
  controllers: [EmailController],
  providers: [EmailService],
})
export class EmailModule {}
