import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EmailService } from '../src/email/v1/email.service';
import { EmailIdentityEntity } from '../src/entity/email-identity.entity';
import { AccountEntity } from '../src/entity/account.entity';
import { Repository } from '@libs/database';

describe('EmailService', () => {
  let service: EmailService;
  let emailIdentityRepository: jest.Mocked<Repository<EmailIdentityEntity>>;
  let accountRepository: jest.Mocked<Repository<AccountEntity>>;

  beforeEach(() => {
    emailIdentityRepository = {
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Repository<EmailIdentityEntity>>;

    accountRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<AccountEntity>>;

    service = new EmailService(emailIdentityRepository, accountRepository);
  });

  describe('verify', () => {
    const email = 'user@example.com';
    const code = '123456';

    it('throws NotFoundException when email is not found', async () => {
      emailIdentityRepository.findOne.mockResolvedValue(null);

      await expect(service.verify(email, code)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when email is already verified', async () => {
      emailIdentityRepository.findOne.mockResolvedValue({
        email,
        verified: true,
        verificationCode: code,
        verificationExpireDate: new Date(Date.now() + 60_000),
      } as EmailIdentityEntity);

      await expect(service.verify(email, code)).rejects.toThrow(
        new BadRequestException('Email is already verified'),
      );
    });

    it('throws BadRequestException when verification code is wrong', async () => {
      emailIdentityRepository.findOne.mockResolvedValue({
        email,
        verified: false,
        verificationCode: 'wrong-code',
        verificationExpireDate: new Date(Date.now() + 60_000),
      } as EmailIdentityEntity);

      await expect(service.verify(email, code)).rejects.toThrow(
        new BadRequestException('Invalid verification code'),
      );
    });

    it('throws BadRequestException when verification code has expired', async () => {
      emailIdentityRepository.findOne.mockResolvedValue({
        email,
        verified: false,
        verificationCode: code,
        verificationExpireDate: new Date(Date.now() - 1000), // past
      } as EmailIdentityEntity);

      await expect(service.verify(email, code)).rejects.toThrow(
        new BadRequestException('Verification code has expired'),
      );
    });

    it('updates email_identity and returns uuid when code is valid', async () => {
      const emailIdentity: Partial<EmailIdentityEntity> = {
        email,
        uid: 10,
        verified: false,
        verificationCode: code,
        verificationExpireDate: new Date(Date.now() + 60_000),
      };
      const account: Partial<AccountEntity> = { uid: 10, uuid: 'uuid-abc' };

      emailIdentityRepository.findOne.mockResolvedValue(emailIdentity as EmailIdentityEntity);
      accountRepository.findOne.mockResolvedValue(account as AccountEntity);

      const result = await service.verify(email, code);

      expect(result).toBe('uuid-abc');
      expect(emailIdentityRepository.update).toHaveBeenCalledWith(
        { email },
        { verified: true, verificationCode: null, verificationExpireDate: null },
      );
    });
  });

  describe('resend', () => {
    const email = 'user@example.com';

    it('throws NotFoundException when email is not found', async () => {
      emailIdentityRepository.findOne.mockResolvedValue(null);

      await expect(service.resend(email)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when email is already verified', async () => {
      emailIdentityRepository.findOne.mockResolvedValue({
        email,
        verified: true,
      } as EmailIdentityEntity);

      await expect(service.resend(email)).rejects.toThrow(
        new BadRequestException('Email is already verified'),
      );
    });

    it('updates verification code and expiry for unverified account', async () => {
      emailIdentityRepository.findOne.mockResolvedValue({
        email,
        verified: false,
        verificationCode: '000000',
        verificationExpireDate: new Date(),
      } as EmailIdentityEntity);

      await service.resend(email);

      expect(emailIdentityRepository.update).toHaveBeenCalledWith(
        { email },
        {
          verificationCode: expect.stringMatching(/^\d{6}$/),
          verificationExpireDate: expect.any(Date),
        },
      );
    });
  });
});
