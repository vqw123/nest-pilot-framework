import { Injectable, NotImplementedException } from '@nestjs/common';
/**
 * Apple Sign-In 서비스.
 * Apple 개발자 계정이 필요한 기능으로, 구조만 잡아두고 구현은 추후 진행한다.
 */
@Injectable()
export class AppleSigninService {
  async signIn(_projectId: string, _idToken: string): Promise<{ uid: number }> {
    throw new NotImplementedException('Apple Sign-In is not yet implemented');
  }
}
