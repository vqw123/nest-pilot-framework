import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EmailSigninService } from '../src/signin/v1/service/email-signin.service';
import { EmailAccountEntity } from '../src/entity/email-account.entity';
import { AccountEntity } from '../src/entity/account.entity';
import { Repository } from '@libs/database';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('EmailSigninService', () => {
  let service: EmailSigninService;
  let emailAccountRepository: jest.Mocked<Repository<EmailAccountEntity>>;
  let accountRepository: jest.Mocked<Repository<AccountEntity>>;

  beforeEach(() => {
    emailAccountRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<EmailAccountEntity>>;

    accountRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<AccountEntity>>;

    service = new EmailSigninService(emailAccountRepository, accountRepository);
  });

  describe('signIn', () => {
    const email = 'user@example.com';
    const password = 'secret123';

    it('throws UnauthorizedException when email is not found', async () => {
      emailAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.signIn(email, password)).rejects.toThrow(
        new UnauthorizedException('Email or password is incorrect'),
      );
    });

    it('throws UnauthorizedException when email is not verified', async () => {
      const emailAccount: Partial<EmailAccountEntity> = {
        email,
        uuid: 'uuid-1',
        passwordHash: 'hash',
        verified: false,
      };
      emailAccountRepository.findOne.mockResolvedValue(emailAccount as EmailAccountEntity);

      await expect(service.signIn(email, password)).rejects.toThrow(
        new UnauthorizedException('Email is not verified'),
      );
    });

    it('throws UnauthorizedException when password is wrong', async () => {
      const emailAccount: Partial<EmailAccountEntity> = {
        email,
        uuid: 'uuid-1',
        passwordHash: 'hash',
        verified: true,
      };
      emailAccountRepository.findOne.mockResolvedValue(emailAccount as EmailAccountEntity);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.signIn(email, password)).rejects.toThrow(
        new UnauthorizedException('Email or password is incorrect'),
      );
    });

    it('returns uid when credentials are valid', async () => {
      const emailAccount: Partial<EmailAccountEntity> = {
        email,
        uuid: 'uuid-1',
        passwordHash: 'hash',
        verified: true,
      };
      const account: Partial<AccountEntity> = { uid: 42, uuid: 'uuid-1' };

      emailAccountRepository.findOne.mockResolvedValue(emailAccount as EmailAccountEntity);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      accountRepository.findOne.mockResolvedValue(account as AccountEntity);

      const result = await service.signIn(email, password);

      expect(result).toEqual({ uid: 42 });
    });
  });
});
