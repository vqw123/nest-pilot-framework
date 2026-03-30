import { Module } from '@nestjs/common';
import { DatabaseModule } from '@libs/database';
import { TokenModule } from '../../token/v1/token.module';
import { SigninController } from './signin.controller';
import { AccountService } from './service/account.service';
import { GoogleSigninService } from './service/google-signin.service';
import { AppleSigninService } from './service/apple-signin.service';
import { EmailSigninService } from './service/email-signin.service';
import { AccountEntity } from '../../entity/account.entity';
import { IdentityEntity } from '../../entity/identity.entity';
import { IdentityPropertiesEntity } from '../../entity/identity-properties.entity';
import { ProjectAccountEntity } from '../../entity/project-account.entity';
import { EmailIdentityEntity } from '../../entity/email-identity.entity';
import { OauthConfigEntity } from '../../entity/oauth-config.entity';
import { ProjectEntity } from '../../entity/project.entity';

@Module({
  imports: [
    TokenModule,
    DatabaseModule.forFeature([
      AccountEntity,
      IdentityEntity,
      IdentityPropertiesEntity,
      ProjectAccountEntity,
      EmailIdentityEntity,
      OauthConfigEntity,
      ProjectEntity,
    ]),
  ],
  controllers: [SigninController],
  providers: [AccountService, GoogleSigninService, AppleSigninService, EmailSigninService],
  exports: [AccountService, GoogleSigninService],
})
export class SigninModule {}
