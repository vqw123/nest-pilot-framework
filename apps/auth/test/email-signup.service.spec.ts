import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EmailSignupService } from '../src/signup/v1/service/email-signup.service';
import { EmailAccountEntity } from '../src/entity/email-account.entity';
import { Repository } from '@libs/database';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('EmailSignupService', () => {
  let service: EmailSignupService;
  let emailAccountRepository: jest.Mocked<Repository<EmailAccountEntity>>;
  let dataSource: { transaction: jest.Mock };
  let manager: { create: jest.Mock; save: jest.Mock };

  beforeEach(() => {
    emailAccountRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<EmailAccountEntity>>;

    manager = {
      create: jest.fn().mockReturnValue({}),
      save: jest.fn().mockResolvedValue(undefined),
    };

    dataSource = {
      transaction: jest.fn().mockImplementation(async (cb: (m: typeof manager) => Promise<any>) =>
        cb(manager),
      ),
    };

    service = new EmailSignupService(emailAccountRepository, dataSource as any);
  });

  describe('signUp', () => {
    const email = 'new@example.com';
    const password = 'password123';

    it('throws ConflictException when email already exists', async () => {
      emailAccountRepository.findOne.mockResolvedValue({
        email,
      } as EmailAccountEntity);

      await expect(service.signUp(email, password)).rejects.toThrow(
        new ConflictException('Email already registered'),
      );

      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('creates account and emailAccount in a transaction for new email', async () => {
      emailAccountRepository.findOne.mockResolvedValue(null);

      await service.signUp(email, password);

      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      // AccountEntity creation
      expect(manager.create).toHaveBeenCalledWith(
        expect.anything(), // AccountEntity
        expect.objectContaining({ uuid: expect.any(String) }),
      );
      // EmailAccountEntity creation
      expect(manager.create).toHaveBeenCalledWith(
        expect.anything(), // EmailAccountEntity
        expect.objectContaining({
          email,
          passwordHash: 'hashed-password',
          verified: false,
          verificationCode: expect.any(String),
          verificationExpireDate: expect.any(Date),
        }),
      );
      expect(manager.save).toHaveBeenCalledTimes(2);
    });

    it('hashes the password using bcrypt', async () => {
      emailAccountRepository.findOne.mockResolvedValue(null);

      await service.signUp(email, password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
    });
  });
});
