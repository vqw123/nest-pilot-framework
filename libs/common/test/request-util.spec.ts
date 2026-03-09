import { RequestUtil } from '../src/utils/request-util';
import { Request } from 'express';

const createRequest = (headers: Record<string, string>, ip?: string): Request =>
  ({ headers, ip } as unknown as Request);

describe('RequestUtil', () => {
  describe('getClientIp', () => {
    it('should return cloudfront-viewer-address first', () => {
      const req = createRequest({
        'cloudfront-viewer-address': '1.2.3.4:1234',
        'x-forwarded-for': '5.6.7.8',
      });

      expect(RequestUtil.getClientIp(req)).toBe('1.2.3.4');
    });

    it('should fallback to x-forwarded-for when cloudfront header is absent', () => {
      const req = createRequest({ 'x-forwarded-for': '5.6.7.8, 9.10.11.12' });

      expect(RequestUtil.getClientIp(req)).toBe('5.6.7.8');
    });

    it('should fallback to request.ip when no headers', () => {
      const req = createRequest({}, '3.4.5.6');

      expect(RequestUtil.getClientIp(req)).toBe('3.4.5.6');
    });

    it('should strip IPv4-mapped IPv6 prefix', () => {
      const req = createRequest({ 'x-forwarded-for': '::ffff:1.2.3.4' });

      expect(RequestUtil.getClientIp(req)).toBe('1.2.3.4');
    });

    it('should return empty string when no ip info available', () => {
      const req = createRequest({});

      expect(RequestUtil.getClientIp(req)).toBe('');
    });
  });

  describe('getClientCountry', () => {
    it('should return cloudfront-viewer-country header', () => {
      const req = createRequest({ 'cloudfront-viewer-country': 'KR' });

      expect(RequestUtil.getClientCountry(req)).toBe('KR');
    });

    it('should return empty string when header is absent', () => {
      const req = createRequest({});

      expect(RequestUtil.getClientCountry(req)).toBe('');
    });
  });
});
