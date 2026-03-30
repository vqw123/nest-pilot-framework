import { Module } from '@nestjs/common';
import { DatabaseModule } from '@libs/database';
import { SessionModule } from '../../session/v1/session.module';
import { SigninModule } from '../../signin/v1/signin.module';
import { SignupController } from './signup.controller';
import { EmailSignupService } from './service/email-signup.service';
import { AccountEntity } from '../../entity/account.entity';
import { EmailIdentityEntity } from '../../entity/email-identity.entity';
import { ProjectAccountEntity } from '../../entity/project-account.entity';
import { ProjectEntity } from '../../entity/project.entity';

@Module({
  imports: [
    SessionModule,
    SigninModule,
    DatabaseModule.forFeature([
      AccountEntity,
      EmailIdentityEntity,
      ProjectAccountEntity,
      ProjectEntity,
    ]),
  ],
  controllers: [SignupController],
  providers: [EmailSignupService],
})
export class SignupModule {}
