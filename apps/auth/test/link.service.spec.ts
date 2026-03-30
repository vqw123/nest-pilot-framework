import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LinkService } from '../src/link/v1/link.service';
import { IdentityEntity } from '../src/entity/identity.entity';
import { EmailIdentityEntity } from '../src/entity/email-identity.entity';
import { AccountEntity } from '../src/entity/account.entity';
import { Provider } from '../src/entity/provider.enum';
import { Repository } from '@libs/database';

describe('LinkService', () => {
  let service: LinkService;
  let identityRepository: jest.Mocked<Repository<IdentityEntity>>;
  let emailIdentityRepository: jest.Mocked<Repository<EmailIdentityEntity>>;
  let accountRepository: jest.Mocked<Repository<AccountEntity>>;

  beforeEach(() => {
    identityRepository = {
      findOne: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      count: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Repository<IdentityEntity>>;

    emailIdentityRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<EmailIdentityEntity>>;

    accountRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<AccountEntity>>;

    service = new LinkService(identityRepository, emailIdentityRepository, accountRepository);
  });

  describe('linkSocial', () => {
    const uuid = 'uuid-mine';
    const provider = Provider.GOOGLE;
    const providerUserId = 'google-sub-abc';

    it('throws NotFoundException when account is not found', async () => {
      accountRepository.findOne.mockResolvedValue(null);

      await expect(service.linkSocial(uuid, provider, providerUserId)).rejects.toThrow(
        new NotFoundException('Account not found'),
      );
    });

    it('throws BadRequestException when identity is already linked to another account', async () => {
      const account: Partial<AccountEntity> = { uid: 1, uuid };
      const existingIdentity: Partial<IdentityEntity> = {
        provider,
        providerUserId,
        uid: 99, // different account
      };

      accountRepository.findOne.mockResolvedValue(account as AccountEntity);
      identityRepository.findOne.mockResolvedValue(existingIdentity as IdentityEntity);

      await expect(service.linkSocial(uuid, provider, providerUserId)).rejects.toThrow(
        new BadRequestException('This social account is already linked to another account'),
      );
    });

    it('saves identity when it does not exist yet', async () => {
      const account: Partial<AccountEntity> = { uid: 1, uuid };

      accountRepository.findOne.mockResolvedValue(account as AccountEntity);
      identityRepository.findOne.mockResolvedValue(null);

      await service.linkSocial(uuid, provider, providerUserId);

      expect(identityRepository.save).toHaveBeenCalledWith({
        provider,
        providerUserId,
        uid: 1,
      });
    });

    it('skips save when identity already belongs to the same account', async () => {
      const account: Partial<AccountEntity> = { uid: 1, uuid };
      const existingIdentity: Partial<IdentityEntity> = {
        provider,
        providerUserId,
        uid: 1, // same account
      };

      accountRepository.findOne.mockResolvedValue(account as AccountEntity);
      identityRepository.findOne.mockResolvedValue(existingIdentity as IdentityEntity);

      await service.linkSocial(uuid, provider, providerUserId);

      expect(identityRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('unlinkSocial', () => {
    const uuid = 'uuid-1';
    const provider = Provider.GOOGLE;

    it('throws NotFoundException when account is not found', async () => {
      accountRepository.findOne.mockResolvedValue(null);

      await expect(service.unlinkSocial(uuid, provider)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when identity is not linked', async () => {
      const account: Partial<AccountEntity> = { uid: 1, uuid };
      accountRepository.findOne.mockResolvedValue(account as AccountEntity);
      identityRepository.findOne.mockResolvedValue(null);

      await expect(service.unlinkSocial(uuid, provider)).rejects.toThrow(
        new NotFoundException('Social account not linked'),
      );
    });

    it('throws BadRequestException when it is the last login method and no email identity', async () => {
      const account: Partial<AccountEntity> = { uid: 1, uuid };
      const identity: Partial<IdentityEntity> = { provider, providerUserId: 'google-sub', uid: 1 };

      accountRepository.findOne.mockResolvedValue(account as AccountEntity);
      identityRepository.findOne.mockResolvedValue(identity as IdentityEntity);
      identityRepository.count.mockResolvedValue(1); // only 1 social identity
      emailIdentityRepository.findOne.mockResolvedValue(null); // no email

      await expect(service.unlinkSocial(uuid, provider)).rejects.toThrow(
        new BadRequestException('Cannot unlink: at least one login method must remain'),
      );
    });

    it('deletes identity when account has an email identity', async () => {
      const account: Partial<AccountEntity> = { uid: 1, uuid };
      const identity: Partial<IdentityEntity> = { provider, providerUserId: 'google-sub', uid: 1 };

      accountRepository.findOne.mockResolvedValue(account as AccountEntity);
      identityRepository.findOne.mockResolvedValue(identity as IdentityEntity);
      identityRepository.count.mockResolvedValue(1); // only 1 social identity
      emailIdentityRepository.findOne.mockResolvedValue({
        email: 'user@example.com',
        uid: 1,
      } as EmailIdentityEntity);

      await service.unlinkSocial(uuid, provider);

      expect(identityRepository.delete).toHaveBeenCalledWith({ provider, uid: 1 });
    });

    it('deletes identity when other social identities remain', async () => {
      const account: Partial<AccountEntity> = { uid: 1, uuid };
      const identity: Partial<IdentityEntity> = { provider, providerUserId: 'google-sub', uid: 1 };

      accountRepository.findOne.mockResolvedValue(account as AccountEntity);
      identityRepository.findOne.mockResolvedValue(identity as IdentityEntity);
      identityRepository.count.mockResolvedValue(2); // 2 social identities → safe to unlink
      emailIdentityRepository.findOne.mockResolvedValue(null);

      await service.unlinkSocial(uuid, provider);

      expect(identityRepository.delete).toHaveBeenCalledWith({ provider, uid: 1 });
    });
  });
});
