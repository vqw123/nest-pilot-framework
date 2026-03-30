import { ConflictException, NotFoundException } from '@nestjs/common';
import { AccountService } from '../src/signin/v1/service/account.service';
import { AccountEntity } from '../src/entity/account.entity';
import { IdentityEntity } from '../src/entity/identity.entity';
import { IdentityPropertiesEntity } from '../src/entity/identity-properties.entity';
import { ProjectAccountEntity } from '../src/entity/project-account.entity';
import { Provider } from '../src/entity/provider.enum';
import { Repository } from '@libs/database';

describe('AccountService', () => {
  let service: AccountService;
  let accountRepository: jest.Mocked<Repository<AccountEntity>>;
  let identityRepository: jest.Mocked<Repository<IdentityEntity>>;
  let identityPropertiesRepository: jest.Mocked<Repository<IdentityPropertiesEntity>>;
  let projectAccountRepository: jest.Mocked<Repository<ProjectAccountEntity>>;
  let dataSource: { transaction: jest.Mock };
  let manager: { create: jest.Mock; save: jest.Mock; findOne: jest.Mock };

  const profile = {
    provider: Provider.GOOGLE,
    providerUserId: 'google-sub-123',
    email: 'test@example.com',
    name: 'Test User',
    profilePictureUrl: 'https://example.com/pic.jpg',
  };

  beforeEach(() => {
    accountRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<AccountEntity>>;

    identityRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<IdentityEntity>>;

    identityPropertiesRepository = {
      upsert: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Repository<IdentityPropertiesEntity>>;

    projectAccountRepository = {
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Repository<ProjectAccountEntity>>;

    manager = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    dataSource = {
      transaction: jest.fn().mockImplementation(async (cb: (m: typeof manager) => Promise<any>) =>
        cb(manager),
      ),
    };

    service = new AccountService(
      accountRepository,
      identityRepository,
      identityPropertiesRepository,
      projectAccountRepository,
      dataSource as any,
    );
  });

  describe('signInWithSocial', () => {
    const projectId = 'project-1';

    it('returns { uuid } when identity and project_account exist', async () => {
      const identity: Partial<IdentityEntity> = { provider: Provider.GOOGLE, providerUserId: 'google-sub-123', uid: 1 };
      const projectAccount: Partial<ProjectAccountEntity> = { projectId, uid: 1 };
      const account: Partial<AccountEntity> = { uid: 1, uuid: 'uuid-abc' };

      identityRepository.findOne.mockResolvedValue(identity as IdentityEntity);
      projectAccountRepository.findOne.mockResolvedValue(projectAccount as ProjectAccountEntity);
      accountRepository.findOne.mockResolvedValue(account as AccountEntity);

      const result = await service.signInWithSocial(projectId, profile);

      expect(result).toEqual({ uuid: 'uuid-abc' });
      expect(projectAccountRepository.update).toHaveBeenCalledWith(
        { projectId, uid: 1 },
        expect.objectContaining({ lastLoginDate: expect.any(Date) }),
      );
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when identity does not exist', async () => {
      identityRepository.findOne.mockResolvedValue(null);

      await expect(service.signInWithSocial(projectId, profile)).rejects.toThrow(
        new NotFoundException('Social account not registered in this project'),
      );
    });

    it('throws NotFoundException when project_account does not exist', async () => {
      const identity: Partial<IdentityEntity> = { provider: Provider.GOOGLE, providerUserId: 'google-sub-123', uid: 1 };

      identityRepository.findOne.mockResolvedValue(identity as IdentityEntity);
      projectAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.signInWithSocial(projectId, profile)).rejects.toThrow(
        new NotFoundException('Social account not registered in this project'),
      );
    });
  });

  describe('signUpWithSocial', () => {
    const projectId = 'project-1';

    it('throws ConflictException when identity and project_account both exist', async () => {
      const identity: Partial<IdentityEntity> = { provider: Provider.GOOGLE, providerUserId: 'google-sub-123', uid: 1 };
      const projectAccount: Partial<ProjectAccountEntity> = { projectId, uid: 1 };

      identityRepository.findOne.mockResolvedValue(identity as IdentityEntity);
      projectAccountRepository.findOne.mockResolvedValue(projectAccount as ProjectAccountEntity);

      await expect(service.signUpWithSocial(projectId, profile)).rejects.toThrow(
        new ConflictException('Social account already registered in this project'),
      );
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('creates only project_account when identity exists in another project (SSO), returns { uuid }', async () => {
      const identity: Partial<IdentityEntity> = { provider: Provider.GOOGLE, providerUserId: 'google-sub-123', uid: 5 };
      const accountInTx: Partial<AccountEntity> = { uid: 5, uuid: 'uuid-existing' };

      identityRepository.findOne.mockResolvedValue(identity as IdentityEntity);
      projectAccountRepository.findOne.mockResolvedValue(null);

      manager.create.mockReturnValue({});
      manager.save.mockResolvedValue(undefined);
      manager.findOne.mockResolvedValue(accountInTx as AccountEntity);

      const result = await service.signUpWithSocial(projectId, profile);

      expect(result).toEqual({ uuid: 'uuid-existing' });
      // Only project_account should be created (no account, no identity)
      expect(manager.create).toHaveBeenCalledTimes(1);
      expect(manager.save).toHaveBeenCalledTimes(1);
    });

    it('creates account + identity + project_account when completely new, returns { uuid }', async () => {
      const savedAccount: Partial<AccountEntity> = { uid: 7, uuid: 'new-uuid' };

      identityRepository.findOne.mockResolvedValue(null);
      projectAccountRepository.findOne.mockResolvedValue(null);

      manager.create.mockReturnValue({});
      manager.save
        .mockResolvedValueOnce(savedAccount) // account save
        .mockResolvedValue(undefined);       // identity + project_account saves
      manager.findOne.mockResolvedValue(savedAccount as AccountEntity);

      const result = await service.signUpWithSocial(projectId, profile);

      expect(result).toEqual({ uuid: 'new-uuid' });
      // Creates account, identity, project_account
      expect(manager.create).toHaveBeenCalledTimes(3);
      expect(manager.save).toHaveBeenCalledTimes(3);
    });
  });
});
