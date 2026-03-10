import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LinkService } from '../src/link/v1/link.service';
import { SocialEntity } from '../src/entity/social.entity';
import { SocialBindingEntity } from '../src/entity/social-binding.entity';
import { AccountEntity } from '../src/entity/account.entity';
import { EmailAccountEntity } from '../src/entity/email-account.entity';
import { Repository } from '@libs/database';

describe('LinkService', () => {
  let service: LinkService;
  let socialRepository: jest.Mocked<Repository<SocialEntity>>;
  let socialBindingRepository: jest.Mocked<Repository<SocialBindingEntity>>;
  let accountRepository: jest.Mocked<Repository<AccountEntity>>;
  let emailAccountRepository: jest.Mocked<Repository<EmailAccountEntity>>;

  beforeEach(() => {
    socialRepository = {
      findOne: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Repository<SocialEntity>>;

    socialBindingRepository = {
      findOne: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      count: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Repository<SocialBindingEntity>>;

    accountRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<AccountEntity>>;

    emailAccountRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<EmailAccountEntity>>;

    service = new LinkService(
      socialRepository,
      socialBindingRepository,
      accountRepository,
      emailAccountRepository,
    );
  });

  describe('linkSocial', () => {
    const uid = 1;
    const projectId = 'project-1';
    const provider = 'google';
    const socialId = 'social-abc';
    const properties = { email: 'test@example.com' };

    it('throws NotFoundException when account is not found', async () => {
      accountRepository.findOne.mockResolvedValue(null);

      await expect(
        service.linkSocial(uid, projectId, provider, socialId, properties),
      ).rejects.toThrow(new NotFoundException('Account not found'));
    });

    it('throws BadRequestException when social is already linked to a different account', async () => {
      const account: Partial<AccountEntity> = { uid, uuid: 'uuid-mine' };
      const existingSocial: Partial<SocialEntity> = {
        provider,
        socialId,
        uuid: 'uuid-other', // different account
      };

      accountRepository.findOne.mockResolvedValue(account as AccountEntity);
      socialRepository.findOne.mockResolvedValue(existingSocial as SocialEntity);

      await expect(
        service.linkSocial(uid, projectId, provider, socialId, properties),
      ).rejects.toThrow(
        new BadRequestException('This social account is already linked to another account'),
      );
    });

    it('saves social and binding when social does not exist yet', async () => {
      const account: Partial<AccountEntity> = { uid, uuid: 'uuid-mine' };

      accountRepository.findOne.mockResolvedValue(account as AccountEntity);
      socialRepository.findOne.mockResolvedValue(null);
      socialBindingRepository.findOne.mockResolvedValue(null);

      await service.linkSocial(uid, projectId, provider, socialId, properties);

      expect(socialRepository.save).toHaveBeenCalledWith({
        provider,
        socialId,
        uuid: 'uuid-mine',
      });
      expect(socialBindingRepository.save).toHaveBeenCalledWith({
        projectId,
        provider,
        socialId,
        uuid: 'uuid-mine',
      });
    });

    it('saves only binding when social exists for the same account', async () => {
      const account: Partial<AccountEntity> = { uid, uuid: 'uuid-mine' };
      const existingSocial: Partial<SocialEntity> = {
        provider,
        socialId,
        uuid: 'uuid-mine', // same uuid
      };

      accountRepository.findOne.mockResolvedValue(account as AccountEntity);
      socialRepository.findOne.mockResolvedValue(existingSocial as SocialEntity);
      socialBindingRepository.findOne.mockResolvedValue(null);

      await service.linkSocial(uid, projectId, provider, socialId, properties);

      expect(socialRepository.save).not.toHaveBeenCalled();
      expect(socialBindingRepository.save).toHaveBeenCalledWith({
        projectId,
        provider,
        socialId,
        uuid: 'uuid-mine',
      });
    });
  });

  describe('unlinkSocial', () => {
    const uid = 1;
    const projectId = 'project-1';
    const provider = 'google';

    it('throws NotFoundException when account is not found', async () => {
      accountRepository.findOne.mockResolvedValue(null);

      await expect(service.unlinkSocial(uid, projectId, provider)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException when binding is not found', async () => {
      const account: Partial<AccountEntity> = { uid, uuid: 'uuid-1' };
      accountRepository.findOne.mockResolvedValue(account as AccountEntity);
      socialBindingRepository.findOne.mockResolvedValue(null);

      await expect(service.unlinkSocial(uid, projectId, provider)).rejects.toThrow(
        new NotFoundException('Social account binding not found'),
      );
    });

    it('throws BadRequestException when it is the last login method and no email', async () => {
      const account: Partial<AccountEntity> = { uid, uuid: 'uuid-1' };
      const binding: Partial<SocialBindingEntity> = {
        projectId,
        provider,
        socialId: 'social-abc',
        uuid: 'uuid-1',
      };

      accountRepository.findOne.mockResolvedValue(account as AccountEntity);
      socialBindingRepository.findOne.mockResolvedValue(binding as SocialBindingEntity);
      socialBindingRepository.count.mockResolvedValue(1); // only 1 binding
      emailAccountRepository.findOne.mockResolvedValue(null); // no email

      await expect(service.unlinkSocial(uid, projectId, provider)).rejects.toThrow(
        new BadRequestException('Cannot unlink: at least one login method must remain'),
      );
    });

    it('deletes binding when account has an email account', async () => {
      const account: Partial<AccountEntity> = { uid, uuid: 'uuid-1' };
      const binding: Partial<SocialBindingEntity> = {
        projectId,
        provider,
        socialId: 'social-abc',
        uuid: 'uuid-1',
      };

      accountRepository.findOne.mockResolvedValue(account as AccountEntity);
      socialBindingRepository.findOne.mockResolvedValue(binding as SocialBindingEntity);
      socialBindingRepository.count.mockResolvedValue(1); // only 1 binding
      emailAccountRepository.findOne.mockResolvedValue({
        email: 'user@example.com',
        uuid: 'uuid-1',
      } as EmailAccountEntity);

      await service.unlinkSocial(uid, projectId, provider);

      expect(socialBindingRepository.delete).toHaveBeenCalledWith({
        projectId,
        provider,
        socialId: 'social-abc',
      });
    });

    it('deletes binding when there are other social bindings remaining', async () => {
      const account: Partial<AccountEntity> = { uid, uuid: 'uuid-1' };
      const binding: Partial<SocialBindingEntity> = {
        projectId,
        provider,
        socialId: 'social-abc',
        uuid: 'uuid-1',
      };

      accountRepository.findOne.mockResolvedValue(account as AccountEntity);
      socialBindingRepository.findOne.mockResolvedValue(binding as SocialBindingEntity);
      socialBindingRepository.count.mockResolvedValue(2); // 2 bindings → safe to unlink
      emailAccountRepository.findOne.mockResolvedValue(null);

      await service.unlinkSocial(uid, projectId, provider);

      expect(socialBindingRepository.delete).toHaveBeenCalledWith({
        projectId,
        provider,
        socialId: 'social-abc',
      });
    });
  });
});
