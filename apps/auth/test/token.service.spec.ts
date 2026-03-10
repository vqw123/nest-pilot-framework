import * as crypto from 'crypto';
import { UnauthorizedException } from '@nestjs/common';
import { TokenService } from '../src/token/v1/token.service';
import { JwtPayload } from '@libs/auth';

// Generate a real RSA key pair so that TokenService crypto operations work
const { privateKey: rsaPrivateKey, publicKey: rsaPublicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
});
const privateKeyPem = rsaPrivateKey.export({ type: 'pkcs8', format: 'pem' }) as string;
const publicKeyPem = rsaPublicKey.export({ type: 'spki', format: 'pem' }) as string;
const privateKeyB64 = Buffer.from(privateKeyPem).toString('base64');
const publicKeyB64 = Buffer.from(publicKeyPem).toString('base64');

describe('TokenService', () => {
  let service: TokenService;
  let configService: { get: jest.Mock };
  let jwtService: { sign: jest.Mock; verify: jest.Mock };

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string) => {
        const map: Record<string, string> = {
          'jwt.privateKey': privateKeyB64,
          'jwt.publicKey': publicKeyB64,
          'jwt.issuer': 'test-issuer',
          'jwt.expiresIn': '1d',
        };
        return map[key];
      }),
    };

    jwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    service = new TokenService(configService as any, jwtService as any);
    service.onModuleInit();
  });

  describe('sign', () => {
    it('returns a string token', () => {
      jwtService.sign.mockReturnValue('mock-token');

      const result = service.sign(42);

      expect(result).toBe('mock-token');
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: 42 },
        expect.objectContaining({
          algorithm: 'RS256',
          issuer: 'test-issuer',
          expiresIn: '1d',
        }),
      );
    });
  });

  describe('verify', () => {
    it('returns JwtPayload when token is valid', () => {
      const payload: JwtPayload = { sub: 1, iss: 'test-issuer', iat: 1000, exp: 2000 };
      jwtService.verify.mockReturnValue(payload);

      const result = service.verify('valid-token');

      expect(result).toEqual(payload);
      expect(jwtService.verify).toHaveBeenCalledWith(
        'valid-token',
        expect.objectContaining({ algorithms: ['RS256'] }),
      );
    });

    it('throws UnauthorizedException when jwtService.verify throws', () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      expect(() => service.verify('invalid-token')).toThrow(UnauthorizedException);
      expect(() => service.verify('invalid-token')).toThrow('Invalid or expired token');
    });
  });

  describe('getPublicKeyJwk', () => {
    it('returns a JWK object with kid, use, and alg fields', () => {
      const jwk = service.getPublicKeyJwk();

      expect(jwk).toHaveProperty('kid');
      expect(jwk.use).toBe('sig');
      expect(jwk.alg).toBe('RS256');
      expect(jwk.kty).toBe('RSA');
    });

    it('returns a consistent kid for the same key', () => {
      const jwk1 = service.getPublicKeyJwk();
      const jwk2 = service.getPublicKeyJwk();

      expect(jwk1.kid).toBe(jwk2.kid);
    });

    it('kid is a non-empty string', () => {
      const jwk = service.getPublicKeyJwk();

      expect(typeof jwk.kid).toBe('string');
      expect(jwk.kid.length).toBeGreaterThan(0);
    });
  });
});
