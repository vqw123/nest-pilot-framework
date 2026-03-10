import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository, Repository, DataSource } from '@libs/database';
import { EmailAccountEntity } from '../../../entity/email-account.entity';
import { AccountEntity } from '../../../entity/account.entity';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const BCRYPT_ROUNDS = 12;
const VERIFICATION_EXPIRE_MINUTES = 30;

@Injectable()
export class EmailSignupService {
  private readonly logger = new Logger(EmailSignupService.name);

  constructor(
    @InjectRepository(EmailAccountEntity)
    private readonly emailAccountRepository: Repository<EmailAccountEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async signUp(email: string, password: string): Promise<void> {
    const existing = await this.emailAccountRepository.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const verificationCode = this.generateVerificationCode();
    const verificationExpireDate = new Date(
      Date.now() + VERIFICATION_EXPIRE_MINUTES * 60 * 1000,
    );

    await this.dataSource.transaction(async (manager) => {
      const uuid = randomUUID();

      const account = manager.create(AccountEntity, { uuid });
      await manager.save(AccountEntity, account);

      const emailAccount = manager.create(EmailAccountEntity, {
        email,
        uuid,
        passwordHash,
        verified: false,
        verificationCode,
        verificationExpireDate,
      });
      await manager.save(EmailAccountEntity, emailAccount);
    });

    // TODO: 실제 이메일 발송 서비스로 교체. 현재는 콘솔 로그로 대체한다.
    this.logger.log(`[EMAIL VERIFICATION] To: ${email} | Code: ${verificationCode}`);
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
