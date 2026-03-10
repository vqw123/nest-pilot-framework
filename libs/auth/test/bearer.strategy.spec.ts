jest.mock('passport-jwt', () => ({
  ExtractJwt: { fromAuthHeaderAsBearerToken: jest.fn().mockReturnValue((): null => null) },
  Strategy: class { constructor(_opts: any) {} },
}));
jest.mock('jwks-rsa', () => ({
  passportJwtSecret: jest.fn().mockReturnValue(jest.fn()),
}));

import { BearerStrategy } from '../src/bearer/bearer.strategy';
import { JwtPayload } from '../src/interfaces/jwt-payload.interface';

describe('BearerStrategy', () => {
  describe('constructor', () => {
    it('should throw when neither jwksUri nor publicKey is provided', () => {
      expect(() => new BearerStrategy({})).toThrow(
        /jwksUri 또는 publicKey/,
      );
    });

    it('should construct successfully with publicKey', () => {
      const publicKey = Buffer.from('dummy-key').toString('base64');

      expect(() => new BearerStrategy({ publicKey })).not.toThrow();
    });

    it('should construct successfully with jwksUri', () => {
      expect(() =>
        new BearerStrategy({ jwksUri: 'http://localhost/jwks.json' }),
      ).not.toThrow();
    });
  });

  describe('validate', () => {
    it('should return the payload as-is', () => {
      const publicKey = Buffer.from('dummy-key').toString('base64');
      const strategy = new BearerStrategy({ publicKey });

      const payload: JwtPayload = { sub: 1, iss: 'test', iat: 0, exp: 9999 };
      const result = strategy.validate(payload);

      expect(result).toBe(payload);
    });
  });
});
