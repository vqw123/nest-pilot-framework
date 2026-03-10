import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository, Repository, DataSource } from '@libs/database';
import { AccountEntity } from '../../../entity/account.entity';
import { SocialEntity } from '../../../entity/social.entity';
import { SocialBindingEntity } from '../../../entity/social-binding.entity';
import { SocialPropertiesEntity } from '../../../entity/social-properties.entity';
import { randomUUID } from 'crypto';

export interface SocialProfile {
  provider: string;
  socialId: string;
  properties: Record<string, any>;
}

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(SocialEntity)
    private readonly socialRepository: Repository<SocialEntity>,
    @InjectRepository(SocialBindingEntity)
    private readonly socialBindingRepository: Repository<SocialBindingEntity>,
    @InjectRepository(SocialPropertiesEntity)
    private readonly socialPropertiesRepository: Repository<SocialPropertiesEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 소셜 로그인. 이 프로젝트에 바인딩된 계정이 없으면 NotFoundException.
   * 게임 백엔드가 signin 실패 시 signup으로 fallback하는 방식을 지원한다.
   */
  async signInWithSocial(projectId: string, profile: SocialProfile): Promise<{ uid: number }> {
    const { provider, socialId, properties } = profile;

    const binding = await this.socialBindingRepository.findOne({
      where: { projectId, provider, socialId },
    });

    if (!binding) {
      throw new NotFoundException('Social account not registered in this project');
    }

    const account = await this.accountRepository.findOne({ where: { uuid: binding.uuid } });
    await this.upsertProperties(provider, socialId, properties);
    return { uid: account.uid };
  }

  /**
   * 소셜 회원가입. 이미 바인딩된 계정이 있으면 ConflictException.
   *
   * 1. 다른 프로젝트에 가입한 동일 소셜 계정 → binding만 추가 (SSO)
   * 2. 완전 신규 → account + social + binding 생성
   */
  async signUpWithSocial(projectId: string, profile: SocialProfile): Promise<{ uid: number }> {
    const { provider, socialId, properties } = profile;

    const existingBinding = await this.socialBindingRepository.findOne({
      where: { projectId, provider, socialId },
    });

    if (existingBinding) {
      throw new ConflictException('Social account already registered in this project');
    }

    const existingSocial = await this.socialRepository.findOne({ where: { provider, socialId } });

    return await this.dataSource.transaction(async (manager) => {
      let uuid: string;

      if (existingSocial) {
        // 다른 프로젝트에 가입한 유저 → 이 프로젝트 binding만 추가 (SSO)
        uuid = existingSocial.uuid;
      } else {
        // 완전 신규 → account + social 생성
        uuid = randomUUID();
        const account = manager.create(AccountEntity, { uuid });
        await manager.save(AccountEntity, account);
        const social = manager.create(SocialEntity, { provider, socialId, uuid });
        await manager.save(SocialEntity, social);
      }

      const binding = manager.create(SocialBindingEntity, { projectId, provider, socialId, uuid });
      await manager.save(SocialBindingEntity, binding);

      const account = await manager.findOne(AccountEntity, { where: { uuid } });
      await this.upsertProperties(provider, socialId, properties);
      return { uid: account.uid };
    });
  }

  private async upsertProperties(
    provider: string,
    socialId: string,
    properties: Record<string, any>,
  ): Promise<void> {
    await this.socialPropertiesRepository.upsert(
      { provider, socialId, properties },
      { conflictPaths: ['provider', 'socialId'] },
    );
  }
}
