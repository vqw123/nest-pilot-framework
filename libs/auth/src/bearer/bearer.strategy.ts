import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { BearerModuleOptions } from './bearer-module-options.interface';

export const BEARER_MODULE_OPTIONS = 'BEARER_MODULE_OPTIONS';

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy, 'bearer') {
  constructor(
    @Inject(BEARER_MODULE_OPTIONS) options: BearerModuleOptions,
  ) {
    if (!options.jwksUri && !options.publicKey) {
      throw new Error('BearerModule: jwksUri 또는 publicKey 중 하나를 설정해야 합니다.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ...(options.jwksUri
        ? {
            secretOrKeyProvider: passportJwtSecret({
              jwksUri: options.jwksUri,
              cache: true,
              cacheMaxEntries: 5,
              cacheMaxAge: 10 * 60 * 1000, // 10분 캐시
              rateLimit: true,
              jwksRequestsPerMinute: 10,
            }),
          }
        : {
            secretOrKey: Buffer.from(options.publicKey, 'base64').toString('utf-8'),
          }),
      issuer: options.issuer,
      audience: options.audience,
      algorithms: options.algorithms ?? ['RS256'],
      ignoreExpiration: false,
    });
  }

  /** passport-jwt가 검증 완료 후 호출. 반환값이 request.user에 주입됨. */
  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
