import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository, Repository } from '@libs/database';
import { EmailAccountEntity } from '../../../entity/email-account.entity';
import { AccountEntity } from '../../../entity/account.entity';
import * as bcrypt from 'bcrypt';

export interface EmailSignInResult {
  uid: number;
}

@Injectable()
export class EmailSigninService {
  constructor(
    @InjectRepository(EmailAccountEntity)
    private readonly emailAccountRepository: Repository<EmailAccountEntity>,
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
  ) {}

  async signIn(email: string, password: string): Promise<EmailSignInResult> {
    const emailAccount = await this.emailAccountRepository.findOne({ where: { email } });

    if (!emailAccount) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    if (!emailAccount.verified) {
      throw new UnauthorizedException('Email is not verified');
    }

    const isPasswordValid = await bcrypt.compare(password, emailAccount.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    const account = await this.accountRepository.findOne({ where: { uuid: emailAccount.uuid } });
    return { uid: account.uid };
  }
}
