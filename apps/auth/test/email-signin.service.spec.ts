import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EmailSigninService } from '../src/signin/v1/service/email-signin.service';
import { EmailIdentityEntity } from '../src/entity/email-identity.entity';
import { AccountEntity } from '../src/entity/account.entity';
import { ProjectAccountEntity } from '../src/entity/project-account.entity';
import { Repository } from '@libs/database';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('EmailSigninService', () => {
  let service: EmailSigninService;
  let emailIdentityRepository: jest.Mocked<Repository<EmailIdentityEntity>>;
  let accountRepository: jest.Mocked<Repository<AccountEntity>>;
  let projectAccountRepository: jest.Mocked<Repository<ProjectAccountEntity>>;

  beforeEach(() => {
    emailIdentityRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<EmailIdentityEntity>>;

    accountRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<AccountEntity>>;

    projectAccountRepository = {
      update: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Repository<ProjectAccountEntity>>;

    service = new EmailSigninService(
      emailIdentityRepository,
      accountRepository,
      projectAccountRepository,
    );
  });

  describe('signIn', () => {
    const projectId = 'project-1';
    const email = 'user@example.com';
    const password = 'secret123';

    it('throws UnauthorizedException when email is not found', async () => {
      emailIdentityRepository.findOne.mockResolvedValue(null);

      await expect(service.signIn(projectId, email, password)).rejects.toThrow(
        new UnauthorizedException('Email or password is incorrect'),
      );
    });

    it('throws UnauthorizedException when email is not verified', async () => {
      const emailIdentity: Partial<EmailIdentityEntity> = {
        email,
        uid: 1,
        passwordHash: 'hash',
        verified: false,
      };
      emailIdentityRepository.findOne.mockResolvedValue(emailIdentity as EmailIdentityEntity);

      await expect(service.signIn(projectId, email, password)).rejects.toThrow(
        new UnauthorizedException('Email is not verified'),
      );
    });

    it('throws UnauthorizedException when password is wrong', async () => {
      const emailIdentity: Partial<EmailIdentityEntity> = {
        email,
        uid: 1,
        passwordHash: 'hash',
        verified: true,
      };
      emailIdentityRepository.findOne.mockResolvedValue(emailIdentity as EmailIdentityEntity);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.signIn(projectId, email, password)).rejects.toThrow(
        new UnauthorizedException('Email or password is incorrect'),
      );
    });

    it('returns { uuid } and updates last_login_date when credentials are valid', async () => {
      const emailIdentity: Partial<EmailIdentityEntity> = {
        email,
        uid: 42,
        passwordHash: 'hash',
        verified: true,
      };
      const account: Partial<AccountEntity> = { uid: 42, uuid: 'uuid-abc' };

      emailIdentityRepository.findOne.mockResolvedValue(emailIdentity as EmailIdentityEntity);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      accountRepository.findOne.mockResolvedValue(account as AccountEntity);

      const result = await service.signIn(projectId, email, password);

      expect(result).toEqual({ uuid: 'uuid-abc' });
      expect(projectAccountRepository.update).toHaveBeenCalledWith(
        { projectId, uid: 42 },
        expect.objectContaining({ lastLoginDate: expect.any(Date) }),
      );
    });
  });
});
