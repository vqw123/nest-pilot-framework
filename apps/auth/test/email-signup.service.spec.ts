import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EmailSignupService } from '../src/signup/v1/service/email-signup.service';
import { EmailIdentityEntity } from '../src/entity/email-identity.entity';
import { Repository } from '@libs/database';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('EmailSignupService', () => {
  let service: EmailSignupService;
  let emailIdentityRepository: jest.Mocked<Repository<EmailIdentityEntity>>;
  let dataSource: { transaction: jest.Mock };
  let manager: { create: jest.Mock; save: jest.Mock };

  beforeEach(() => {
    emailIdentityRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<EmailIdentityEntity>>;

    manager = {
      create: jest.fn().mockReturnValue({}),
      save: jest.fn(),
    };

    dataSource = {
      transaction: jest.fn().mockImplementation(async (cb: (m: typeof manager) => Promise<any>) =>
        cb(manager),
      ),
    };

    service = new EmailSignupService(emailIdentityRepository, dataSource as any);
  });

  describe('signUp', () => {
    const projectId = 'project-1';
    const email = 'new@example.com';
    const password = 'password123';

    it('throws ConflictException when email already exists', async () => {
      emailIdentityRepository.findOne.mockResolvedValue({ email } as EmailIdentityEntity);

      await expect(service.signUp(projectId, email, password)).rejects.toThrow(
        new ConflictException('Email already registered'),
      );

      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('creates account, email_identity, and project_account in a transaction', async () => {
      emailIdentityRepository.findOne.mockResolvedValue(null);

      // First save (AccountEntity) returns uid for subsequent creates
      manager.save
        .mockResolvedValueOnce({ uid: 1, uuid: 'new-uuid' })
        .mockResolvedValue(undefined);

      await service.signUp(projectId, email, password);

      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      // AccountEntity creation
      expect(manager.create).toHaveBeenCalledWith(
        expect.anything(), // AccountEntity
        expect.objectContaining({ uuid: expect.any(String) }),
      );
      // EmailIdentityEntity creation
      expect(manager.create).toHaveBeenCalledWith(
        expect.anything(), // EmailIdentityEntity
        expect.objectContaining({
          email,
          passwordHash: 'hashed-password',
          verified: false,
          verificationCode: expect.any(String),
          verificationExpireDate: expect.any(Date),
        }),
      );
      // ProjectAccountEntity creation
      expect(manager.create).toHaveBeenCalledWith(
        expect.anything(), // ProjectAccountEntity
        expect.objectContaining({ projectId }),
      );
      expect(manager.save).toHaveBeenCalledTimes(3);
    });

    it('hashes the password using bcrypt', async () => {
      emailIdentityRepository.findOne.mockResolvedValue(null);
      manager.save.mockResolvedValueOnce({ uid: 1, uuid: 'new-uuid' }).mockResolvedValue(undefined);

      await service.signUp(projectId, email, password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12);
    });
  });
});
