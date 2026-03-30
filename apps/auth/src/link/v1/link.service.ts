import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository, Repository } from '@libs/database';
import { IdentityEntity } from '../../entity/identity.entity';
import { EmailIdentityEntity } from '../../entity/email-identity.entity';
import { AccountEntity } from '../../entity/account.entity';
import { Provider } from '../../entity/provider.enum';

@Injectable()
export class LinkService {
  constructor(
    @InjectRepository(IdentityEntity)
    private readonly identityRepository: Repository<IdentityEntity>,
    @InjectRepository(EmailIdentityEntity)
    private readonly emailIdentityRepository: Repository<EmailIdentityEntity>,
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
  ) {}

  /**
   * 소셜 계정을 현재 로그인된 계정(uuid)에 연동한다.
   * 이미 다른 계정에 연동된 소셜이면 BadRequestException.
   */
  async linkSocial(
    uuid: string,
    provider: Provider,
    providerUserId: string,
  ): Promise<void> {
    const account = await this.accountRepository.findOne({ where: { uuid } });
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const existing = await this.identityRepository.findOne({
      where: { provider, providerUserId },
    });

    if (existing && existing.uid !== account.uid) {
      throw new BadRequestException('This social account is already linked to another account');
    }

    if (!existing) {
      await this.identityRepository.save({ provider, providerUserId, uid: account.uid });
    }
  }

  /**
   * 소셜 계정 연동을 해제한다.
   * identity(소셜) + email_identity 합산 기준으로 최소 1개의 로그인 수단이 남아있어야 한다.
   */
  async unlinkSocial(uuid: string, provider: Provider): Promise<void> {
    const account = await this.accountRepository.findOne({ where: { uuid } });
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const identity = await this.identityRepository.findOne({
      where: { provider, uid: account.uid },
    });

    if (!identity) {
      throw new NotFoundException('Social account not linked');
    }

    // 최소 1개 로그인 수단 보장: 소셜 identity 개수 + 이메일 identity 존재 여부 (전역 기준)
    const socialCount = await this.identityRepository.count({ where: { uid: account.uid } });
    const hasEmail = await this.emailIdentityRepository.findOne({ where: { uid: account.uid } });

    if (socialCount <= 1 && !hasEmail) {
      throw new BadRequestException('Cannot unlink: at least one login method must remain');
    }

    await this.identityRepository.delete({ provider, uid: account.uid });
  }
}
