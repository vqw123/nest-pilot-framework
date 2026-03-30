import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RedisService } from '@libs/redis';
import { TokenService } from '../../token/v1/token.service';
import { SigninResponseDto } from '../../signin/v1/dto/signin-response.dto';
import { randomUUID } from 'crypto';

/**
 * Redis에 저장되는 세션 레코드.
 * sessionId === refresh token 값이며, Redis key는 `auth:session:{sessionId}`.
 */
export interface SessionRecord {
  /** 세션 식별자 (refresh token 값과 동일). */
  sessionId: string;
  /** 계정 외부 식별자. JWT sub와 동일. */
  uuid: string;
  /** 세션이 속한 프로젝트. JWT aud와 동일. */
  projectId: string;
  /** 세션 최초 생성 시각 (Unix ms). 갱신해도 변하지 않는다. */
  createdAt: number;
  /** 마지막 갱신(refresh) 시각 (Unix ms). */
  lastUsedAt: number;
  /** 세션 만료 예정 시각 (Unix ms). 갱신 시 rolling 연장된다. */
  expiresAt: number;
  /** 클라이언트 User-Agent (선택). */
  userAgent?: string;
  /** 클라이언트 IP (선택). */
  ip?: string;
}

/** 세션 생성 시 전달할 수 있는 클라이언트 메타데이터. */
export interface ClientInfo {
  userAgent?: string;
  ip?: string;
}

@Injectable()
export class SessionService {
  /** Refresh token TTL: 30일 (rolling) */
  private readonly TTL_SECONDS = 30 * 24 * 60 * 60;
  private readonly KEY_PREFIX = 'auth:session:';

  constructor(
    private readonly tokenService: TokenService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * 로그인 성공 후 세션을 생성한다.
   * Access token(RS256 JWT, 30m) + Refresh token(opaque UUID, 30d)을 반환한다.
   */
  async createSession(
    uuid: string,
    projectId: string,
    clientInfo?: ClientInfo,
  ): Promise<SigninResponseDto> {
    const accessToken = this.tokenService.sign(uuid, projectId);
    const sessionId = randomUUID();
    const now = Date.now();

    const record: SessionRecord = {
      sessionId,
      uuid,
      projectId,
      createdAt: now,
      lastUsedAt: now,
      expiresAt: now + this.TTL_SECONDS * 1000,
      ...(clientInfo?.userAgent != null && { userAgent: clientInfo.userAgent }),
      ...(clientInfo?.ip != null && { ip: clientInfo.ip }),
    };

    const redis = this.redisService.getOrThrow();
    await redis.set(
      this.KEY_PREFIX + sessionId,
      JSON.stringify(record),
      'EX',
      this.TTL_SECONDS,
    );

    return { accessToken, refreshToken: sessionId };
  }

  /**
   * Refresh token으로 세션을 갱신한다.
   * - 기존 토큰을 삭제하고 새 토큰 쌍을 발급한다 (token rotation).
   * - createdAt은 최초 생성 시각을 보존한다.
   * - lastUsedAt과 expiresAt은 갱신 시각 기준으로 rolling 연장된다.
   */
  async refreshSession(refreshToken: string): Promise<SigninResponseDto> {
    const redis = this.redisService.getOrThrow();
    const key = this.KEY_PREFIX + refreshToken;

    const raw = await redis.get(key);
    if (!raw) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const old = JSON.parse(raw) as SessionRecord;
    await redis.del(key);

    const newSessionId = randomUUID();
    const now = Date.now();
    const accessToken = this.tokenService.sign(old.uuid, old.projectId);

    const newRecord: SessionRecord = {
      ...old,
      sessionId: newSessionId,
      lastUsedAt: now,
      expiresAt: now + this.TTL_SECONDS * 1000,
    };

    await redis.set(
      this.KEY_PREFIX + newSessionId,
      JSON.stringify(newRecord),
      'EX',
      this.TTL_SECONDS,
    );

    return { accessToken, refreshToken: newSessionId };
  }

  /**
   * Refresh token을 즉시 폐기한다 (로그아웃).
   * 없는 토큰은 무시한다.
   */
  async revokeSession(refreshToken: string): Promise<void> {
    const redis = this.redisService.getOrThrow();
    await redis.del(this.KEY_PREFIX + refreshToken);
  }
}
