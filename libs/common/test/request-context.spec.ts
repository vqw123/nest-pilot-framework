import { RequestContext } from '../src/utils/request-context';

describe('RequestContext', () => {
  describe('set / get', () => {
    it('should store and retrieve a value within run()', () => {
      RequestContext.run(() => {
        RequestContext.set('key', 'value');
        expect(RequestContext.get('key')).toBe('value');
      });
    });

    it('should return null when accessed outside run()', () => {
      expect(RequestContext.get('key')).toBeNull();
    });

    it('should isolate values between separate run() calls', async () => {
      const results: string[] = [];

      await Promise.all([
        new Promise<void>((resolve) => {
          RequestContext.run(() => {
            RequestContext.set('requestId', 'aaa');
            setTimeout(() => {
              results.push(RequestContext.get('requestId'));
              resolve();
            }, 10);
          });
        }),
        new Promise<void>((resolve) => {
          RequestContext.run(() => {
            RequestContext.set('requestId', 'bbb');
            setTimeout(() => {
              results.push(RequestContext.get('requestId'));
              resolve();
            }, 10);
          });
        }),
      ]);

      expect(results).toContain('aaa');
      expect(results).toContain('bbb');
    });
  });

  describe('getRequestId', () => {
    it('should return requestId when set', () => {
      RequestContext.run(() => {
        RequestContext.set('requestId', 'abc-123');
        expect(RequestContext.getRequestId()).toBe('abc-123');
      });
    });

    it('should return UNKNOWN_REQUEST_ID when not set', () => {
      expect(RequestContext.getRequestId()).toBe('UNKNOWN_REQUEST_ID');
    });
  });

  describe('getClientIp', () => {
    it('should return ip when set', () => {
      RequestContext.run(() => {
        RequestContext.set('ip', '1.2.3.4');
        expect(RequestContext.getClientIp()).toBe('1.2.3.4');
      });
    });

    it('should return UNKNOWN_IP when not set', () => {
      expect(RequestContext.getClientIp()).toBe('UNKNOWN_IP');
    });
  });
});
