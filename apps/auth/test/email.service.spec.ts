import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EmailService } from '../src/email/v1/email.service';
import { EmailAccountEntity } from '../src/entity/email-account.entity';
import { AccountEntity } from '../src/entity/account.entity';
import { Repository } from '@libs/database';

describe('EmailService', () => {
  let service: EmailService;
  let emailAccountRepository: jest.Mocked<Repository<EmailAccountEntity>>;
  let accountRepository: jest.Mocked<Repository<AccountEntity>>;

  beforeEach(() => {
    emailAccountRepository = {
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Repository<EmailAccountEntity>>;

    accountRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<AccountEntity>>;

    service = new EmailService(emailAccountRepository, accountRepository);
  });

  describe('verify', () => {
    const email = 'user@example.com';
    const code = '123456';

    it('throws NotFoundException when email is not found', async () => {
      emailAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.verify(email, code)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when email is already verified', async () => {
      emailAccountRepository.findOne.mockResolvedValue({
        email,
        verified: true,
        verificationCode: code,
        verificationExpireDate: new Date(Date.now() + 60_000),
      } as EmailAccountEntity);

      await expect(service.verify(email, code)).rejects.toThrow(
        new BadRequestException('Email is already verified'),
      );
    });

    it('throws BadRequestException when verification code is wrong', async () => {
      emailAccountRepository.findOne.mockResolvedValue({
        email,
        verified: false,
        verificationCode: 'wrong-code',
        verificationExpireDate: new Date(Date.now() + 60_000),
      } as EmailAccountEntity);

      await expect(service.verify(email, code)).rejects.toThrow(
        new BadRequestException('Invalid verification code'),
      );
    });

    it('throws BadRequestException when verification code has expired', async () => {
      emailAccountRepository.findOne.mockResolvedValue({
        email,
        verified: false,
        verificationCode: code,
        verificationExpireDate: new Date(Date.now() - 1000), // past
      } as EmailAccountEntity);

      await expect(service.verify(email, code)).rejects.toThrow(
        new BadRequestException('Verification code has expired'),
      );
    });

    it('updates the account and returns uid when code is valid', async () => {
      const emailAccount: Partial<EmailAccountEntity> = {
        email,
        uuid: 'uuid-1',
        verified: false,
        verificationCode: code,
        verificationExpireDate: new Date(Date.now() + 60_000),
      };
      const account: Partial<AccountEntity> = { uid: 10, uuid: 'uuid-1' };

      emailAccountRepository.findOne.mockResolvedValue(emailAccount as EmailAccountEntity);
      accountRepository.findOne.mockResolvedValue(account as AccountEntity);

      const uid = await service.verify(email, code);

      expect(uid).toBe(10);
      expect(emailAccountRepository.update).toHaveBeenCalledWith(
        { email },
        { verified: true, verificationCode: null, verificationExpireDate: null },
      );
    });
  });

  describe('resend', () => {
    const email = 'user@example.com';

    it('throws NotFoundException when email is not found', async () => {
      emailAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.resend(email)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when email is already verified', async () => {
      emailAccountRepository.findOne.mockResolvedValue({
        email,
        verified: true,
      } as EmailAccountEntity);

      await expect(service.resend(email)).rejects.toThrow(
        new BadRequestException('Email is already verified'),
      );
    });

    it('updates verification code and expiry for unverified account', async () => {
      emailAccountRepository.findOne.mockResolvedValue({
        email,
        verified: false,
        verificationCode: '000000',
        verificationExpireDate: new Date(),
      } as EmailAccountEntity);

      await service.resend(email);

      expect(emailAccountRepository.update).toHaveBeenCalledWith(
        { email },
        {
          verificationCode: expect.stringMatching(/^\d{6}$/),
          verificationExpireDate: expect.any(Date),
        },
      );
    });
  });
});
