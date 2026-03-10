import { Module } from '@nestjs/common';
import { DatabaseModule } from '@libs/database';
import { TokenModule } from '../../token/v1/token.module';
import { SigninModule } from '../../signin/v1/signin.module';
import { LinkController } from './link.controller';
import { LinkService } from './link.service';
import { SocialEntity } from '../../entity/social.entity';
import { SocialBindingEntity } from '../../entity/social-binding.entity';
import { AccountEntity } from '../../entity/account.entity';
import { EmailAccountEntity } from '../../entity/email-account.entity';
import { ProjectEntity } from '../../entity/project.entity';

@Module({
  imports: [
    TokenModule,
    SigninModule,
    DatabaseModule.forFeature([
      SocialEntity,
      SocialBindingEntity,
      AccountEntity,
      EmailAccountEntity,
      ProjectEntity,
    ]),
  ],
  controllers: [LinkController],
  providers: [LinkService],
})
export class LinkModule {}
