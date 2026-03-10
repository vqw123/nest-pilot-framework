import { NotImplementedException } from '@nestjs/common';
import { AppleSigninService } from '../src/signin/v1/service/apple-signin.service';

describe('AppleSigninService', () => {
  let service: AppleSigninService;

  beforeEach(() => {
    service = new AppleSigninService();
  });

  describe('signIn', () => {
    it('always throws NotImplementedException', async () => {
      await expect(service.signIn('project-1', 'id-token')).rejects.toThrow(
        NotImplementedException,
      );
    });

    it('throws with expected message', async () => {
      await expect(service.signIn('project-1', 'id-token')).rejects.toThrow(
        'Apple Sign-In is not yet implemented',
      );
    });
  });
});
