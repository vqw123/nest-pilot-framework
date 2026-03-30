import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RedisService } from '@libs/redis';
import { TokenService } from '../../token/v1/token.service';
import { SigninResponseDto } from '../../signin/v1/dto/signin-response.dto';
import { randomUUID } from 'crypto';

interface SessionPayload {
  uuid: string;
  projectId: string;
}

@Injectable()
export class SessionService {
  /** Refresh token TTL: 30일 */
  private readonly TTL_SECONDS = 30 * 24 * 60 * 60;
  private readonly KEY_PREFIX = 'auth:session:';

  constructor(
    private readonly tokenService: TokenService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * 로그인 성공 후 세션을 생성한다.
   * Access token(JWT) + Refresh token(opaque UUID)을 반환한다.
   */
  async createSession(uuid: string, projectId: string): Promise<SigninResponseDto> {
    const accessToken = this.tokenService.sign(uuid, projectId);
    const refreshToken = randomUUID();

    const redis = this.redisService.getOrThrow();
    await redis.set(
      this.KEY_PREFIX + refreshToken,
      JSON.stringify({ uuid, projectId } satisfies SessionPayload),
      'EX',
      this.TTL_SECONDS,
    );

    return { accessToken, refreshToken };
  }

  /**
   * Refresh token으로 세션을 갱신한다.
   * 기존 토큰을 삭제하고 새 토큰 쌍을 발급한다 (token rotation).
   */
  async refreshSession(refreshToken: string): Promise<SigninResponseDto> {
    const redis = this.redisService.getOrThrow();
    const key = this.KEY_PREFIX + refreshToken;

    const raw = await redis.get(key);
    if (!raw) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const { uuid, projectId } = JSON.parse(raw) as SessionPayload;

    await redis.del(key);
    return this.createSession(uuid, projectId);
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
