import { UnauthorizedException } from '@nestjs/common';
import { BearerGuard } from '../src/bearer/bearer.guard';

describe('BearerGuard', () => {
  let guard: BearerGuard;

  beforeEach(() => {
    guard = new BearerGuard();
  });

  describe('handleRequest', () => {
    it('should return payload when err is null and user is present', () => {
      const payload = { sub: 1, iss: 'test', iat: 0, exp: 9999 };

      const result = guard.handleRequest(null, payload);

      expect(result).toBe(payload);
    });

    it('should throw UnauthorizedException when err is null and user is null', () => {
      expect(() => guard.handleRequest(null, null)).toThrow(
        new UnauthorizedException('Invalid or expired token'),
      );
    });

    it('should throw UnauthorizedException when err is an Error', () => {
      expect(() => guard.handleRequest(new Error('err'), null)).toThrow(
        new UnauthorizedException('Invalid or expired token'),
      );
    });
  });
});
