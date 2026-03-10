import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository, Repository } from '@libs/database';
import { EmailAccountEntity } from '../../entity/email-account.entity';
import { AccountEntity } from '../../entity/account.entity';

const VERIFICATION_EXPIRE_MINUTES = 30;

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @InjectRepository(EmailAccountEntity)
    private readonly emailAccountRepository: Repository<EmailAccountEntity>,
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
  ) {}

  /** 인증 코드 확인 → 인증 완료 처리 후 uid 반환 */
  async verify(email: string, code: string): Promise<number> {
    const emailAccount = await this.emailAccountRepository.findOne({ where: { email } });
    if (!emailAccount) {
      throw new NotFoundException('Email account not found');
    }

    if (emailAccount.verified) {
      throw new BadRequestException('Email is already verified');
    }

    if (emailAccount.verificationCode !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    if (new Date() > emailAccount.verificationExpireDate) {
      throw new BadRequestException('Verification code has expired');
    }

    await this.emailAccountRepository.update(
      { email },
      { verified: true, verificationCode: null, verificationExpireDate: null },
    );

    const account = await this.accountRepository.findOne({ where: { uuid: emailAccount.uuid } });
    return account.uid;
  }

  /** 인증 코드 재발송 */
  async resend(email: string): Promise<void> {
    const emailAccount = await this.emailAccountRepository.findOne({ where: { email } });
    if (!emailAccount) {
      throw new NotFoundException('Email account not found');
    }

    if (emailAccount.verified) {
      throw new BadRequestException('Email is already verified');
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpireDate = new Date(
      Date.now() + VERIFICATION_EXPIRE_MINUTES * 60 * 1000,
    );

    await this.emailAccountRepository.update(
      { email },
      { verificationCode, verificationExpireDate },
    );

    // TODO: 실제 이메일 발송 서비스로 교체
    this.logger.log(`[EMAIL VERIFICATION] To: ${email} | Code: ${verificationCode}`);
  }
}
