import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { InjectRepository, Repository } from '@libs/database';
import { OauthConfigEntity } from '../../../entity/oauth-config.entity';
import { AccountService } from './account.service';

interface GoogleClientData {
  client_id: string;
}

export interface GoogleProfile {
  socialId: string;
  properties: Record<string, any>;
}

@Injectable()
export class GoogleSigninService {
  constructor(
    @InjectRepository(OauthConfigEntity)
    private readonly oauthConfigRepository: Repository<OauthConfigEntity>,
    private readonly accountService: AccountService,
  ) {}

  /**
   * Google ID Token을 검증해 사용자 프로필을 반환한다.
   * Authorization Code 교환 없이 클라이언트가 전달한 ID Token을 직접 검증한다.
   */
  async verifyIdToken(projectId: string, idToken: string): Promise<GoogleProfile> {
    const config = await this.oauthConfigRepository.findOne({
      where: { projectId, provider: 'google' },
    });

    if (!config) {
      throw new UnauthorizedException('Google OAuth is not configured for this project');
    }

    const { client_id } = JSON.parse(config.clientData) as GoogleClientData;
    const client = new OAuth2Client(client_id);

    const ticket = await client.verifyIdToken({
      idToken,
      audience: client_id,
    }).catch(() => {
      throw new UnauthorizedException('Failed to verify Google ID token');
    });

    const payload = ticket.getPayload();
    return {
      socialId: payload.sub,
      properties: { email: payload.email, name: payload.name, picture: payload.picture },
    };
  }

  /** Google ID Token으로 로그인. 미가입 유저면 NotFoundException. */
  async signIn(projectId: string, idToken: string): Promise<{ uid: number }> {
    const profile = await this.verifyIdToken(projectId, idToken);
    return this.accountService.signInWithSocial(projectId, {
      provider: 'google',
      socialId: profile.socialId,
      properties: profile.properties,
    });
  }

  /** Google ID Token으로 회원가입. 이미 가입된 유저면 ConflictException. */
  async signUp(projectId: string, idToken: string): Promise<{ uid: number }> {
    const profile = await this.verifyIdToken(projectId, idToken);
    return this.accountService.signUpWithSocial(projectId, {
      provider: 'google',
      socialId: profile.socialId,
      properties: profile.properties,
    });
  }
}
