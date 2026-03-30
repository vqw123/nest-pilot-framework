import { UnauthorizedException } from '@nestjs/common';
import { SessionService } from '../src/session/v1/session.service';
import { TokenService } from '../src/token/v1/token.service';
import { RedisService } from '@libs/redis';
import { Redis } from 'ioredis';

describe('SessionService', () => {
  let service: SessionService;
  let tokenService: jest.Mocked<Pick<TokenService, 'sign'>>;
  let redisService: jest.Mocked<Pick<RedisService, 'getOrThrow'>>;
  let redis: jest.Mocked<Pick<Redis, 'set' | 'get' | 'del'>>;

  beforeEach(() => {
    redis = {
      set: jest.fn().mockResolvedValue('OK'),
      get: jest.fn(),
      del: jest.fn().mockResolvedValue(1),
    };

    tokenService = {
      sign: jest.fn().mockReturnValue('mock-access-token'),
    };

    redisService = {
      getOrThrow: jest.fn().mockReturnValue(redis),
    };

    service = new SessionService(
      tokenService as unknown as TokenService,
      redisService as unknown as RedisService,
    );
  });

  describe('createSession', () => {
    it('issues access token and stores refresh token in Redis', async () => {
      const result = await service.createSession('uuid-1', 'project-1');

      expect(tokenService.sign).toHaveBeenCalledWith('uuid-1', 'project-1');
      expect(result.accessToken).toBe('mock-access-token');
      expect(typeof result.refreshToken).toBe('string');
      expect(result.refreshToken.length).toBeGreaterThan(0);

      expect(redis.set).toHaveBeenCalledWith(
        expect.stringContaining('auth:session:'),
        expect.stringContaining('"uuid":"uuid-1"'),
        'EX',
        expect.any(Number),
      );
    });

    it('generates unique refresh tokens on each call', async () => {
      const r1 = await service.createSession('uuid-1', 'project-1');
      const r2 = await service.createSession('uuid-1', 'project-1');

      expect(r1.refreshToken).not.toBe(r2.refreshToken);
    });
  });

  describe('refreshSession', () => {
    it('rotates the refresh token and returns new token pair', async () => {
      const oldToken = 'old-refresh-uuid';
      redis.get.mockResolvedValue(JSON.stringify({ uuid: 'uuid-1', projectId: 'project-1' }));

      const result = await service.refreshSession(oldToken);

      // Old token deleted
      expect(redis.del).toHaveBeenCalledWith(`auth:session:${oldToken}`);
      // New session created
      expect(tokenService.sign).toHaveBeenCalledWith('uuid-1', 'project-1');
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).not.toBe(oldToken);
    });

    it('throws UnauthorizedException when refresh token does not exist in Redis', async () => {
      redis.get.mockResolvedValue(null);

      await expect(service.refreshSession('nonexistent-token')).rejects.toThrow(
        new UnauthorizedException('Invalid or expired refresh token'),
      );

      expect(redis.del).not.toHaveBeenCalled();
      expect(tokenService.sign).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when refresh token is expired (null from Redis)', async () => {
      redis.get.mockResolvedValue(null);

      await expect(service.refreshSession('expired-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('revokeSession (logout)', () => {
    it('deletes the refresh token key from Redis', async () => {
      const token = 'revoke-me';

      await service.revokeSession(token);

      expect(redis.del).toHaveBeenCalledWith(`auth:session:${token}`);
    });

    it('does not throw when refresh token does not exist', async () => {
      redis.del.mockResolvedValue(0); // 0 = key did not exist

      await expect(service.revokeSession('nonexistent')).resolves.toBeUndefined();
    });
  });
});
