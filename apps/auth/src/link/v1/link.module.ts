import { Module } from '@nestjs/common';
import { DatabaseModule } from '@libs/database';
import { TokenModule } from '../../token/v1/token.module';
import { SigninModule } from '../../signin/v1/signin.module';
import { LinkController } from './link.controller';
import { LinkService } from './link.service';
import { IdentityEntity } from '../../entity/identity.entity';
import { EmailIdentityEntity } from '../../entity/email-identity.entity';
import { AccountEntity } from '../../entity/account.entity';
import { ProjectEntity } from '../../entity/project.entity';

@Module({
  imports: [
    TokenModule,
    SigninModule,
    DatabaseModule.forFeature([
      IdentityEntity,
      EmailIdentityEntity,
      AccountEntity,
      ProjectEntity,
    ]),
  ],
  controllers: [LinkController],
  providers: [LinkService],
})
export class LinkModule {}
