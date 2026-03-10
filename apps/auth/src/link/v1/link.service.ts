import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository, Repository } from '@libs/database';
import { SocialEntity } from '../../entity/social.entity';
import { SocialBindingEntity } from '../../entity/social-binding.entity';
import { AccountEntity } from '../../entity/account.entity';
import { EmailAccountEntity } from '../../entity/email-account.entity';

@Injectable()
export class LinkService {
  constructor(
    @InjectRepository(SocialEntity)
    private readonly socialRepository: Repository<SocialEntity>,
    @InjectRepository(SocialBindingEntity)
    private readonly socialBindingRepository: Repository<SocialBindingEntity>,
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(EmailAccountEntity)
    private readonly emailAccountRepository: Repository<EmailAccountEntity>,
  ) {}

  /**
   * 소셜 계정을 현재 로그인된 계정(uid)에 연동한다.
   * AccountService.signInWithSocial 과 달리 기존 uuid를 유지하고 새 소셜을 연결한다.
   */
  async linkSocial(
    uid: number,
    projectId: string,
    provider: string,
    socialId: string,
    _properties: Record<string, any>,
  ): Promise<void> {
    const account = await this.accountRepository.findOne({ where: { uid } });
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const existing = await this.socialRepository.findOne({ where: { provider, socialId } });
    if (existing && existing.uuid !== account.uuid) {
      throw new BadRequestException('This social account is already linked to another account');
    }

    if (!existing) {
      await this.socialRepository.save({ provider, socialId, uuid: account.uuid });
    }

    const existingBinding = await this.socialBindingRepository.findOne({
      where: { projectId, provider, socialId },
    });

    if (!existingBinding) {
      await this.socialBindingRepository.save({
        projectId,
        provider,
        socialId,
        uuid: account.uuid,
      });
    }
  }

  /**
   * 소셜 계정 연동을 해제한다.
   * 최소 1개의 로그인 수단이 남아있어야 한다.
   */
  async unlinkSocial(uid: number, projectId: string, provider: string): Promise<void> {
    const account = await this.accountRepository.findOne({ where: { uid } });
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const binding = await this.socialBindingRepository.findOne({
      where: { projectId, provider, uuid: account.uuid },
    });

    if (!binding) {
      throw new NotFoundException('Social account binding not found');
    }

    // 최소 1개 로그인 수단 보장: 남은 소셜 binding + 이메일 계정 합산
    const remainingBindings = await this.socialBindingRepository.count({
      where: { projectId, uuid: account.uuid },
    });

    const hasEmail = await this.emailAccountRepository.findOne({
      where: { uuid: account.uuid },
    });

    if (remainingBindings <= 1 && !hasEmail) {
      throw new BadRequestException(
        'Cannot unlink: at least one login method must remain',
      );
    }

    await this.socialBindingRepository.delete({ projectId, provider, socialId: binding.socialId });
  }
}
