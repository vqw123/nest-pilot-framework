import { Module } from '@nestjs/common';
import { DatabaseModule } from '@libs/database';
import { SigninModule } from '../../signin/v1/signin.module';
import { LinkController } from './link.controller';
import { LinkService } from './link.service';
import { IdentityEntity } from '../../entity/identity.entity';
import { EmailIdentityEntity } from '../../entity/email-identity.entity';
import { AccountEntity } from '../../entity/account.entity';

@Module({
  imports: [
    SigninModule,
    DatabaseModule.forFeature([IdentityEntity, EmailIdentityEntity, AccountEntity]),
  ],
  controllers: [LinkController],
  providers: [LinkService],
})
export class LinkModule {}
