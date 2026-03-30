import { UnauthorizedException } from '@nestjs/common';
import { GoogleSigninService } from '../src/signin/v1/service/google-signin.service';
import { OauthConfigEntity } from '../src/entity/oauth-config.entity';
import { Provider } from '../src/entity/provider.enum';
import { Repository } from '@libs/database';

// ---- mock google-auth-library ----
const mockVerifyIdToken = jest.fn();
const mockOAuth2ClientInstance = { verifyIdToken: mockVerifyIdToken };

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => mockOAuth2ClientInstance),
}));

// ---- helpers ----
const PROJECT_ID = 'project-1';
const ID_TOKEN = 'test-id-token';

const mockOauthConfig: Partial<OauthConfigEntity> = {
  projectId: PROJECT_ID,
  provider: Provider.GOOGLE,
  clientData: JSON.stringify({ client_id: 'test-client-id' }),
  redirectUri: 'https://example.com/callback',
};

const mockTicket = {
  getPayload: jest.fn().mockReturnValue({
    sub: 'google-user-123',
    email: 'user@example.com',
    name: 'Test User',
    picture: 'https://example.com/pic.jpg',
  }),
};

describe('GoogleSigninService', () => {
  let service: GoogleSigninService;
  let oauthConfigRepository: jest.Mocked<Repository<OauthConfigEntity>>;
  let accountService: { signInWithSocial: jest.Mock; signUpWithSocial: jest.Mock };

  beforeEach(() => {
    oauthConfigRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<OauthConfigEntity>>;

    accountService = {
      signInWithSocial: jest.fn(),
      signUpWithSocial: jest.fn(),
    };

    service = new GoogleSigninService(oauthConfigRepository, accountService as any);

    jest.clearAllMocks();
    // restore the instance mock after clearAllMocks resets it
    mockOAuth2ClientInstance.verifyIdToken = mockVerifyIdToken;
  });

  // ------------------------------------------------------------------ //
  describe('verifyIdToken', () => {
    it('throws UnauthorizedException when no OAuth config found', async () => {
      oauthConfigRepository.findOne.mockResolvedValue(null);

      await expect(service.verifyIdToken(PROJECT_ID, ID_TOKEN)).rejects.toThrow(
        new UnauthorizedException('Google OAuth is not configured for this project'),
      );
    });

    it('throws UnauthorizedException when google verifyIdToken fails', async () => {
      oauthConfigRepository.findOne.mockResolvedValue(mockOauthConfig as OauthConfigEntity);
      mockVerifyIdToken.mockRejectedValue(new Error('invalid token'));

      await expect(service.verifyIdToken(PROJECT_ID, ID_TOKEN)).rejects.toThrow(
        new UnauthorizedException('Failed to verify Google ID token'),
      );
    });

    it('returns SocialProfile on valid token', async () => {
      oauthConfigRepository.findOne.mockResolvedValue(mockOauthConfig as OauthConfigEntity);
      mockVerifyIdToken.mockResolvedValue(mockTicket);

      const result = await service.verifyIdToken(PROJECT_ID, ID_TOKEN);

      expect(result).toEqual({
        provider: Provider.GOOGLE,
        providerUserId: 'google-user-123',
        email: 'user@example.com',
        name: 'Test User',
        profilePictureUrl: 'https://example.com/pic.jpg',
      });
    });
  });

  // ------------------------------------------------------------------ //
  describe('signIn', () => {
    it('delegates to verifyIdToken then accountService.signInWithSocial, returns { uuid }', async () => {
      oauthConfigRepository.findOne.mockResolvedValue(mockOauthConfig as OauthConfigEntity);
      mockVerifyIdToken.mockResolvedValue(mockTicket);
      accountService.signInWithSocial.mockResolvedValue({ uuid: 'uuid-abc' });

      const result = await service.signIn(PROJECT_ID, ID_TOKEN);

      expect(result).toEqual({ uuid: 'uuid-abc' });
      expect(accountService.signInWithSocial).toHaveBeenCalledWith(
        PROJECT_ID,
        expect.objectContaining({
          provider: Provider.GOOGLE,
          providerUserId: 'google-user-123',
        }),
      );
    });
  });

  // ------------------------------------------------------------------ //
  describe('signUp', () => {
    it('delegates to verifyIdToken then accountService.signUpWithSocial, returns { uuid }', async () => {
      oauthConfigRepository.findOne.mockResolvedValue(mockOauthConfig as OauthConfigEntity);
      mockVerifyIdToken.mockResolvedValue(mockTicket);
      accountService.signUpWithSocial.mockResolvedValue({ uuid: 'uuid-new' });

      const result = await service.signUp(PROJECT_ID, ID_TOKEN);

      expect(result).toEqual({ uuid: 'uuid-new' });
      expect(accountService.signUpWithSocial).toHaveBeenCalledWith(
        PROJECT_ID,
        expect.objectContaining({
          provider: Provider.GOOGLE,
          providerUserId: 'google-user-123',
        }),
      );
    });
  });
});
