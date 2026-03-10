import { UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { BasicGuard } from '../src/basic/basic.guard';
import { BasicModuleOptions } from '../src/basic/basic-module-options.interface';

const makeContext = (headers: Record<string, string> = {}): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ headers }),
    }),
  }) as unknown as ExecutionContext;

describe('BasicGuard', () => {
  let validate: jest.MockedFunction<BasicModuleOptions['validate']>;
  let guard: BasicGuard;

  beforeEach(() => {
    validate = jest.fn();
    guard = new BasicGuard({ validate });
  });

  describe('canActivate', () => {
    it('should throw when authorization header is absent', async () => {
      await expect(guard.canActivate(makeContext())).rejects.toThrow(
        new UnauthorizedException('Missing or invalid authorization header'),
      );
    });

    it('should throw when authorization scheme is not Basic', async () => {
      const ctx = makeContext({ authorization: 'Bearer token' });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        new UnauthorizedException('Missing or invalid authorization header'),
      );
    });

    it('should throw when decoded value contains no colon', async () => {
      const encoded = Buffer.from('user').toString('base64');
      const ctx = makeContext({ authorization: `Basic ${encoded}` });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        new UnauthorizedException('Invalid Basic auth format'),
      );
    });

    it('should throw when validate returns false', async () => {
      validate.mockResolvedValue(false);
      const encoded = Buffer.from('user:wrongpass').toString('base64');
      const ctx = makeContext({ authorization: `Basic ${encoded}` });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
    });

    it('should return true when validate returns true', async () => {
      validate.mockResolvedValue(true);
      const encoded = Buffer.from('user:correctpass').toString('base64');
      const ctx = makeContext({ authorization: `Basic ${encoded}` });

      const result = await guard.canActivate(ctx);

      expect(result).toBe(true);
    });

    it('should call validate with the correct username and password', async () => {
      validate.mockResolvedValue(true);
      const encoded = Buffer.from('admin:s3cr3t').toString('base64');
      const ctx = makeContext({ authorization: `Basic ${encoded}` });

      await guard.canActivate(ctx);

      expect(validate).toHaveBeenCalledWith('admin', 's3cr3t');
    });

    it('should handle passwords that contain colons', async () => {
      validate.mockResolvedValue(true);
      const encoded = Buffer.from('user:pass:with:colons').toString('base64');
      const ctx = makeContext({ authorization: `Basic ${encoded}` });

      await guard.canActivate(ctx);

      expect(validate).toHaveBeenCalledWith('user', 'pass:with:colons');
    });
  });
});
