import { Module } from '@nestjs/common';
import { DatabaseModule } from '@libs/database';
import { TokenModule } from '../../token/v1/token.module';
import { SigninController } from './signin.controller';
import { AccountService } from './service/account.service';
import { GoogleSigninService } from './service/google-signin.service';
import { AppleSigninService } from './service/apple-signin.service';
import { EmailSigninService } from './service/email-signin.service';
import { AccountEntity } from '../../entity/account.entity';
import { SocialEntity } from '../../entity/social.entity';
import { SocialBindingEntity } from '../../entity/social-binding.entity';
import { SocialPropertiesEntity } from '../../entity/social-properties.entity';
import { OauthConfigEntity } from '../../entity/oauth-config.entity';
import { EmailAccountEntity } from '../../entity/email-account.entity';
import { ProjectEntity } from '../../entity/project.entity';

@Module({
  imports: [
    TokenModule,
    DatabaseModule.forFeature([
      AccountEntity,
      SocialEntity,
      SocialBindingEntity,
      SocialPropertiesEntity,
      OauthConfigEntity,
      EmailAccountEntity,
      ProjectEntity,
    ]),
  ],
  controllers: [SigninController],
  providers: [AccountService, GoogleSigninService, AppleSigninService, EmailSigninService],
  exports: [AccountService, GoogleSigninService],
})
export class SigninModule {}
