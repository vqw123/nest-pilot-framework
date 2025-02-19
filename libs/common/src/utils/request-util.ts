import { Request } from 'express';

export class RequestUtil {
  /**
   * 클라이언트 IP를 추출하는 유틸리티 함수
   * @param request Express Request 객체
   * @returns string 클라이언트 IP 주소
   */
  static getClientIp(request: Request): string {
    const remoteIp =
      request.headers['cloudfront-viewer-address'] ||
      request.headers['x-forwarded-for'] ||
      request.ip ||
      '';

    return (typeof remoteIp === 'string' ? remoteIp : (remoteIp[0] ?? ''))
      .split(',')[0]
      .trim()
      .replace(/:\d+$/, '') // ✅ IPv6 주소에서 포트 제거
      .replace(/^::ffff:/, ''); // ✅ IPv4-mapped IPv6 변환
  }

  static getClientCountry(request: Request): string {
    return (request.headers['cloudfront-viewer-country'] as string) || '';
  }
}
