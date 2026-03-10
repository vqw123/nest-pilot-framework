import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@libs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '@libs/auth';
import * as crypto from 'crypto';

@Injectable()
export class TokenService implements OnModuleInit {
  private privateKey: string;
  private publicKey: string;
  private issuer: string;
  private expiresIn: string;
  private kid: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  onModuleInit(): void {
    const privateKeyB64 = this.configService.get<string>('jwt.privateKey');
    const publicKeyB64 = this.configService.get<string>('jwt.publicKey');

    this.privateKey = Buffer.from(privateKeyB64, 'base64').toString('utf-8');
    this.publicKey = Buffer.from(publicKeyB64, 'base64').toString('utf-8');
    this.issuer = this.configService.get<string>('jwt.issuer');
    this.expiresIn = this.configService.get<string>('jwt.expiresIn');
    this.kid = this.computeKid();
  }

  /** uid를 sub으로 하는 RS256 JWT를 발급한다. kid를 헤더에 포함해 JWKS 키 조회를 지원한다. */
  sign(uid: number): string {
    return this.jwtService.sign(
      { sub: uid },
      {
        algorithm: 'RS256',
        privateKey: this.privateKey,
        issuer: this.issuer,
        expiresIn: this.expiresIn as any,
        keyid: this.kid,
      },
    );
  }

  /** JWT 서명을 검증하고 payload를 반환한다. */
  verify(token: string): JwtPayload {
    try {
      return this.jwtService.verify<JwtPayload>(token, {
        algorithms: ['RS256'],
        publicKey: this.publicKey,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /** RSA 공개키를 JWKS 항목 형식의 JWK로 반환한다. */
  getPublicKeyJwk(): Record<string, string> {
    const key = crypto.createPublicKey(this.publicKey);
    const jwk = key.export({ format: 'jwk' }) as Record<string, string>;
    return { ...jwk, kid: this.kid, use: 'sig', alg: 'RS256' };
  }

  /** RFC 7638: {e, kty, n}의 canonical JSON SHA-256 해시를 kid로 사용한다. */
  private computeKid(): string {
    const key = crypto.createPublicKey(this.publicKey);
    const jwk = key.export({ format: 'jwk' }) as Record<string, string>;
    const canonical = JSON.stringify({ e: jwk.e, kty: jwk.kty, n: jwk.n });
    return crypto.createHash('sha256').update(canonical).digest('base64url').slice(0, 16);
  }
}
