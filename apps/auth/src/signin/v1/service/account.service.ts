import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository, Repository, DataSource } from '@libs/database';
import { AccountEntity } from '../../../entity/account.entity';
import { IdentityEntity } from '../../../entity/identity.entity';
import { IdentityPropertiesEntity } from '../../../entity/identity-properties.entity';
import { ProjectAccountEntity } from '../../../entity/project-account.entity';
import { Provider } from '../../../entity/provider.enum';
import { randomUUID } from 'crypto';

export interface SocialProfile {
  provider: Provider;
  providerUserId: string;
  email: string | null;
  name: string | null;
  profilePictureUrl: string | null;
}

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(IdentityEntity)
    private readonly identityRepository: Repository<IdentityEntity>,
    @InjectRepository(IdentityPropertiesEntity)
    private readonly identityPropertiesRepository: Repository<IdentityPropertiesEntity>,
    @InjectRepository(ProjectAccountEntity)
    private readonly projectAccountRepository: Repository<ProjectAccountEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 소셜 로그인. 이 프로젝트에 가입된 계정이 없으면 NotFoundException.
   * 게임 백엔드가 signin 실패 시 signup으로 fallback하는 방식을 지원한다.
   */
  async signInWithSocial(projectId: string, profile: SocialProfile): Promise<{ uuid: string }> {
    const { provider, providerUserId } = profile;

    const identity = await this.identityRepository.findOne({
      where: { provider, providerUserId },
    });

    if (!identity) {
      throw new NotFoundException('Social account not registered in this project');
    }

    const projectAccount = await this.projectAccountRepository.findOne({
      where: { projectId, uid: identity.uid },
    });

    if (!projectAccount) {
      throw new NotFoundException('Social account not registered in this project');
    }

    await this.projectAccountRepository.update(
      { projectId, uid: identity.uid },
      { lastLoginDate: new Date() },
    );

    const account = await this.accountRepository.findOne({ where: { uid: identity.uid } });
    await this.upsertProperties(profile);
    return { uuid: account.uuid };
  }

  /**
   * 소셜 회원가입. 이미 이 프로젝트에 가입된 계정이 있으면 ConflictException.
   *
   * 1. 다른 프로젝트에 가입한 동일 소셜 계정 → project_account만 추가 (SSO)
   * 2. 완전 신규 → account + identity + project_account 생성
   */
  async signUpWithSocial(projectId: string, profile: SocialProfile): Promise<{ uuid: string }> {
    const { provider, providerUserId } = profile;

    const existingIdentity = await this.identityRepository.findOne({
      where: { provider, providerUserId },
    });

    if (existingIdentity) {
      const existingProjectAccount = await this.projectAccountRepository.findOne({
        where: { projectId, uid: existingIdentity.uid },
      });

      if (existingProjectAccount) {
        throw new ConflictException('Social account already registered in this project');
      }
    }

    return await this.dataSource.transaction(async (manager) => {
      let uid: number;

      if (existingIdentity) {
        // 다른 프로젝트에 가입한 유저 → project_account만 추가 (SSO)
        uid = existingIdentity.uid;
      } else {
        // 완전 신규 → account + identity 생성
        const uuid = randomUUID();
        const account = manager.create(AccountEntity, { uuid });
        const savedAccount = await manager.save(AccountEntity, account);
        uid = savedAccount.uid;

        const identity = manager.create(IdentityEntity, { provider, providerUserId, uid });
        await manager.save(IdentityEntity, identity);
      }

      const projectAccount = manager.create(ProjectAccountEntity, {
        projectId,
        uid,
        lastLoginDate: new Date(),
      });
      await manager.save(ProjectAccountEntity, projectAccount);

      const account = await manager.findOne(AccountEntity, { where: { uid } });
      await this.upsertProperties(profile);
      return { uuid: account.uuid };
    });
  }

  private async upsertProperties(profile: SocialProfile): Promise<void> {
    const { provider, providerUserId, email, name, profilePictureUrl } = profile;
    await this.identityPropertiesRepository.upsert(
      { provider, providerUserId, email, name, profilePictureUrl },
      { conflictPaths: ['provider', 'providerUserId'] },
    );
  }
}
