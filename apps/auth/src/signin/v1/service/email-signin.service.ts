import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository, Repository } from '@libs/database';
import { EmailIdentityEntity } from '../../../entity/email-identity.entity';
import { AccountEntity } from '../../../entity/account.entity';
import { ProjectAccountEntity } from '../../../entity/project-account.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmailSigninService {
  constructor(
    @InjectRepository(EmailIdentityEntity)
    private readonly emailIdentityRepository: Repository<EmailIdentityEntity>,
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(ProjectAccountEntity)
    private readonly projectAccountRepository: Repository<ProjectAccountEntity>,
  ) {}

  async signIn(projectId: string, email: string, password: string): Promise<{ uuid: string }> {
    const emailIdentity = await this.emailIdentityRepository.findOne({ where: { email } });

    if (!emailIdentity) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    if (!emailIdentity.verified) {
      throw new UnauthorizedException('Email is not verified');
    }

    const isPasswordValid = await bcrypt.compare(password, emailIdentity.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    await this.projectAccountRepository.update(
      { projectId, uid: emailIdentity.uid },
      { lastLoginDate: new Date() },
    );

    const account = await this.accountRepository.findOne({ where: { uid: emailIdentity.uid } });
    return { uuid: account.uuid };
  }
}
