import { ForbiddenException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { IpGuard } from '../src/ip/ip.guard';

const makeContext = (
  headers: Record<string, string> = {},
  ip = '127.0.0.1',
): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ headers, ip }),
    }),
  }) as unknown as ExecutionContext;

describe('IpGuard', () => {
  describe('canActivate', () => {
    it('should return true when no whitelist and no blacklist are configured', () => {
      const guard = new IpGuard({});

      expect(guard.canActivate(makeContext())).toBe(true);
    });

    it('should throw ForbiddenException when IP is in blacklist', () => {
      const guard = new IpGuard({ blacklist: ['1.2.3.4/32'] });

      expect(() => guard.canActivate(makeContext({}, '1.2.3.4'))).toThrow(
        new ForbiddenException('Access denied'),
      );
    });

    it('should throw ForbiddenException when IP is not in whitelist', () => {
      const guard = new IpGuard({ whitelist: ['10.0.0.0/8'] });

      expect(() => guard.canActivate(makeContext({}, '1.2.3.4'))).toThrow(
        new ForbiddenException('Access denied'),
      );
    });

    it('should return true when IP is in whitelist', () => {
      const guard = new IpGuard({ whitelist: ['10.0.0.0/8'] });

      expect(guard.canActivate(makeContext({}, '10.0.0.5'))).toBe(true);
    });
  });

  describe('IP extraction priority', () => {
    it('should use cloudfront-viewer-address header over x-forwarded-for', () => {
      const guard = new IpGuard({ blacklist: ['1.2.3.4/32'] });
      const ctx = makeContext(
        {
          'cloudfront-viewer-address': '1.2.3.4:12345',
          'x-forwarded-for': '10.0.0.1',
        },
        '10.0.0.1',
      );

      // cloudfront takes priority → IP resolves to 1.2.3.4 → blacklisted
      expect(() => guard.canActivate(ctx)).toThrow(
        new ForbiddenException('Access denied'),
      );
    });

    it('should use x-forwarded-for when cloudfront header is absent', () => {
      const guard = new IpGuard({ blacklist: ['1.2.3.4/32'] });
      const ctx = makeContext(
        { 'x-forwarded-for': '1.2.3.4' },
        '10.0.0.1',
      );

      // x-forwarded-for takes priority over req.ip → blacklisted
      expect(() => guard.canActivate(ctx)).toThrow(
        new ForbiddenException('Access denied'),
      );
    });

    it('should fall back to req.ip when no forwarded headers are present', () => {
      const guard = new IpGuard({ blacklist: ['1.2.3.4/32'] });
      const ctx = makeContext({}, '1.2.3.4');

      // req.ip is the fallback → blacklisted
      expect(() => guard.canActivate(ctx)).toThrow(
        new ForbiddenException('Access denied'),
      );
    });

    it('should use only the first IP from a comma-separated x-forwarded-for value', () => {
      const guard = new IpGuard({ whitelist: ['10.0.0.0/8'] });
      const ctx = makeContext(
        { 'x-forwarded-for': '10.0.0.5, 172.16.0.1' },
        '127.0.0.1',
      );

      expect(guard.canActivate(ctx)).toBe(true);
    });
  });
});
