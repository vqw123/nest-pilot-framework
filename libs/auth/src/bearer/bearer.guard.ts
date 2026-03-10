import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Bearer 토큰 인증 Guard. BearerModule이 등록된 경우 @UseGuards(BearerGuard)로 사용. */
@Injectable()
export class BearerGuard extends AuthGuard('bearer') {
  handleRequest<T>(err: any, user: T): T {
    if (err || !user) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}
