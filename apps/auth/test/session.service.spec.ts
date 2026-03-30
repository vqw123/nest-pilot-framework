import { UnauthorizedException } from '@nestjs/common';
import { SessionService, SessionRecord } from '../src/session/v1/session.service';
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

  // Helper: parse the JSON string passed to redis.set
  function capturedRecord(callIndex = 0): SessionRecord {
    const raw = (redis.set as jest.Mock).mock.calls[callIndex][1] as string;
    return JSON.parse(raw) as SessionRecord;
  }

  describe('createSession', () => {
    it('issues access token and stores session record in Redis', async () => {
      const before = Date.now();
      const result = await service.createSession('uuid-1', 'project-1');
      const after = Date.now();

      expect(tokenService.sign).toHaveBeenCalledWith('uuid-1', 'project-1');
      expect(result.accessToken).toBe('mock-access-token');
      expect(typeof result.refreshToken).toBe('string');
      expect(result.refreshToken.length).toBeGreaterThan(0);

      expect(redis.set).toHaveBeenCalledWith(
        `auth:session:${result.refreshToken}`,
        expect.any(String),
        'EX',
        expect.any(Number),
      );

      const record = capturedRecord();
      expect(record.sessionId).toBe(result.refreshToken);
      expect(record.uuid).toBe('uuid-1');
      expect(record.projectId).toBe('project-1');
      expect(record.createdAt).toBeGreaterThanOrEqual(before);
      expect(record.createdAt).toBeLessThanOrEqual(after);
      expect(record.lastUsedAt).toBe(record.createdAt);
      expect(record.expiresAt).toBeGreaterThan(record.createdAt);
    });

    it('generates unique session IDs on each call', async () => {
      const r1 = await service.createSession('uuid-1', 'project-1');
      const r2 = await service.createSession('uuid-1', 'project-1');

      expect(r1.refreshToken).not.toBe(r2.refreshToken);
    });

    it('stores userAgent and ip when clientInfo is provided', async () => {
      await service.createSession('uuid-1', 'project-1', {
        userAgent: 'Mozilla/5.0',
        ip: '192.168.0.1',
      });

      const record = capturedRecord();
      expect(record.userAgent).toBe('Mozilla/5.0');
      expect(record.ip).toBe('192.168.0.1');
    });

    it('omits clientInfo fields when not provided', async () => {
      await service.createSession('uuid-1', 'project-1');

      const record = capturedRecord();
      expect(record.userAgent).toBeUndefined();
      expect(record.ip).toBeUndefined();
    });
  });

  describe('refreshSession (token rotation)', () => {
    function makeRecord(overrides: Partial<SessionRecord> = {}): SessionRecord {
      const now = Date.now();
      return {
        sessionId: 'old-session-id',
        uuid: 'uuid-1',
        projectId: 'project-1',
        createdAt: now - 60_000,   // created 1 minute ago
        lastUsedAt: now - 60_000,
        expiresAt: now + 29 * 24 * 60 * 60 * 1000,
        ...overrides,
      };
    }

    it('deletes old token and issues new token pair', async () => {
      const oldToken = 'old-refresh-token';
      redis.get.mockResolvedValue(JSON.stringify(makeRecord()));

      const result = await service.refreshSession(oldToken);

      expect(redis.del).toHaveBeenCalledWith(`auth:session:${oldToken}`);
      expect(result.refreshToken).not.toBe(oldToken);
      expect(result.accessToken).toBe('mock-access-token');
    });

    it('preserves createdAt from the original session', async () => {
      const originalCreatedAt = Date.now() - 5 * 60 * 1000; // 5 min ago
      redis.get.mockResolvedValue(JSON.stringify(makeRecord({ createdAt: originalCreatedAt })));

      await service.refreshSession('old-token');

      const newRecord = capturedRecord();
      expect(newRecord.createdAt).toBe(originalCreatedAt);
    });

    it('updates lastUsedAt and rolls expiresAt forward', async () => {
      const before = Date.now();
      const old = makeRecord();
      redis.get.mockResolvedValue(JSON.stringify(old));

      await service.refreshSession('old-token');
      const after = Date.now();

      const newRecord = capturedRecord();
      expect(newRecord.lastUsedAt).toBeGreaterThanOrEqual(before);
      expect(newRecord.lastUsedAt).toBeLessThanOrEqual(after);
      expect(newRecord.expiresAt).toBeGreaterThan(old.expiresAt);
    });

    it('preserves clientInfo across rotation', async () => {
      redis.get.mockResolvedValue(
        JSON.stringify(makeRecord({ userAgent: 'TestAgent/1.0', ip: '10.0.0.1' })),
      );

      await service.refreshSession('old-token');

      const newRecord = capturedRecord();
      expect(newRecord.userAgent).toBe('TestAgent/1.0');
      expect(newRecord.ip).toBe('10.0.0.1');
    });

    it('throws UnauthorizedException when refresh token is not found in Redis', async () => {
      redis.get.mockResolvedValue(null);

      await expect(service.refreshSession('nonexistent-token')).rejects.toThrow(
        new UnauthorizedException('Invalid or expired refresh token'),
      );

      expect(redis.del).not.toHaveBeenCalled();
      expect(tokenService.sign).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when refresh token is expired (null from Redis TTL)', async () => {
      redis.get.mockResolvedValue(null);

      await expect(service.refreshSession('expired-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('revokeSession (logout)', () => {
    it('deletes the session key from Redis', async () => {
      await service.revokeSession('revoke-me');

      expect(redis.del).toHaveBeenCalledWith('auth:session:revoke-me');
    });

    it('does not throw when refresh token does not exist', async () => {
      redis.del.mockResolvedValue(0); // 0 = key did not exist

      await expect(service.revokeSession('nonexistent')).resolves.toBeUndefined();
    });
  });
});
