import { ConflictException, NotFoundException } from '@nestjs/common';
import { AccountService } from '../src/signin/v1/service/account.service';
import { AccountEntity } from '../src/entity/account.entity';
import { SocialEntity } from '../src/entity/social.entity';
import { SocialBindingEntity } from '../src/entity/social-binding.entity';
import { SocialPropertiesEntity } from '../src/entity/social-properties.entity';
import { Repository } from '@libs/database';

describe('AccountService', () => {
  let service: AccountService;
  let accountRepository: jest.Mocked<Repository<AccountEntity>>;
  let socialRepository: jest.Mocked<Repository<SocialEntity>>;
  let socialBindingRepository: jest.Mocked<Repository<SocialBindingEntity>>;
  let socialPropertiesRepository: jest.Mocked<Repository<SocialPropertiesEntity>>;
  let dataSource: { transaction: jest.Mock };
  let manager: { create: jest.Mock; save: jest.Mock; findOne: jest.Mock };

  beforeEach(() => {
    accountRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<AccountEntity>>;

    socialRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<SocialEntity>>;

    socialBindingRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<SocialBindingEntity>>;

    socialPropertiesRepository = {
      upsert: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Repository<SocialPropertiesEntity>>;

    manager = {
      create: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      findOne: jest.fn(),
    };

    dataSource = {
      transaction: jest.fn().mockImplementation(async (cb: (m: typeof manager) => Promise<any>) =>
        cb(manager),
      ),
    };

    service = new AccountService(
      accountRepository,
      socialRepository,
      socialBindingRepository,
      socialPropertiesRepository,
      dataSource as any,
    );
  });

  describe('signInWithSocial', () => {
    const projectId = 'project-1';
    const profile = {
      provider: 'google',
      socialId: 'social-123',
      properties: { email: 'test@example.com' },
    };

    it('returns { uid } when binding exists', async () => {
      const existingBinding: Partial<SocialBindingEntity> = {
        projectId,
        provider: 'google',
        socialId: 'social-123',
        uuid: 'uuid-abc',
      };
      const existingAccount: Partial<AccountEntity> = { uid: 99, uuid: 'uuid-abc' };

      socialBindingRepository.findOne.mockResolvedValue(existingBinding as SocialBindingEntity);
      accountRepository.findOne.mockResolvedValue(existingAccount as AccountEntity);

      const result = await service.signInWithSocial(projectId, profile);

      expect(result).toEqual({ uid: 99 });
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when binding does not exist', async () => {
      socialBindingRepository.findOne.mockResolvedValue(null);

      await expect(service.signInWithSocial(projectId, profile)).rejects.toThrow(
        new NotFoundException('Social account not registered in this project'),
      );
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });
  });

  describe('signUpWithSocial', () => {
    const projectId = 'project-1';
    const profile = {
      provider: 'google',
      socialId: 'social-123',
      properties: { email: 'test@example.com' },
    };

    it('throws ConflictException when binding already exists', async () => {
      const existingBinding: Partial<SocialBindingEntity> = {
        projectId,
        provider: 'google',
        socialId: 'social-123',
        uuid: 'uuid-abc',
      };

      socialBindingRepository.findOne.mockResolvedValue(existingBinding as SocialBindingEntity);

      await expect(service.signUpWithSocial(projectId, profile)).rejects.toThrow(
        new ConflictException('Social account already registered in this project'),
      );
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('creates only binding when social exists in another project, returns { uid }', async () => {
      const existingSocial: Partial<SocialEntity> = {
        provider: 'google',
        socialId: 'social-123',
        uuid: 'uuid-existing',
      };
      const accountInTx: Partial<AccountEntity> = { uid: 55, uuid: 'uuid-existing' };

      socialBindingRepository.findOne.mockResolvedValue(null);
      socialRepository.findOne.mockResolvedValue(existingSocial as SocialEntity);

      manager.create.mockReturnValue({});
      manager.findOne.mockResolvedValue(accountInTx as AccountEntity);

      const result = await service.signUpWithSocial(projectId, profile);

      expect(result).toEqual({ uid: 55 });
      // Only binding should be created (no account, no social)
      expect(manager.create).toHaveBeenCalledTimes(1);
      expect(manager.create).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ uuid: 'uuid-existing' }),
      );
    });

    it('creates account + social + binding when completely new, returns { uid }', async () => {
      const accountInTx: Partial<AccountEntity> = { uid: 77, uuid: expect.any(String) };

      socialBindingRepository.findOne.mockResolvedValue(null);
      socialRepository.findOne.mockResolvedValue(null);

      manager.create.mockReturnValue({});
      manager.findOne.mockResolvedValue(accountInTx as AccountEntity);

      const result = await service.signUpWithSocial(projectId, profile);

      expect(result).toEqual({ uid: 77 });
      // Should create account, social, and binding (3 creates)
      expect(manager.create).toHaveBeenCalledTimes(3);
      expect(manager.save).toHaveBeenCalledTimes(3);
    });
  });
});
