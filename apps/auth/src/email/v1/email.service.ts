import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository, Repository } from '@libs/database';
import { EmailIdentityEntity } from '../../entity/email-identity.entity';
import { AccountEntity } from '../../entity/account.entity';

const VERIFICATION_EXPIRE_MINUTES = 30;

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @InjectRepository(EmailIdentityEntity)
    private readonly emailIdentityRepository: Repository<EmailIdentityEntity>,
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
  ) {}

  /** 인증 코드 확인 → 인증 완료 처리 후 uuid 반환 */
  async verify(email: string, code: string): Promise<string> {
    const emailIdentity = await this.emailIdentityRepository.findOne({ where: { email } });
    if (!emailIdentity) {
      throw new NotFoundException('Email account not found');
    }

    if (emailIdentity.verified) {
      throw new BadRequestException('Email is already verified');
    }

    if (emailIdentity.verificationCode !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    if (new Date() > emailIdentity.verificationExpireDate) {
      throw new BadRequestException('Verification code has expired');
    }

    await this.emailIdentityRepository.update(
      { email },
      { verified: true, verificationCode: null, verificationExpireDate: null },
    );

    const account = await this.accountRepository.findOne({ where: { uid: emailIdentity.uid } });
    return account.uuid;
  }

  /** 인증 코드 재발송 */
  async resend(email: string): Promise<void> {
    const emailIdentity = await this.emailIdentityRepository.findOne({ where: { email } });
    if (!emailIdentity) {
      throw new NotFoundException('Email account not found');
    }

    if (emailIdentity.verified) {
      throw new BadRequestException('Email is already verified');
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpireDate = new Date(
      Date.now() + VERIFICATION_EXPIRE_MINUTES * 60 * 1000,
    );

    await this.emailIdentityRepository.update(
      { email },
      { verificationCode, verificationExpireDate },
    );

    // TODO: 실제 이메일 발송 서비스로 교체
    this.logger.log(`[EMAIL VERIFICATION] To: ${email} | Code: ${verificationCode}`);
  }
}
