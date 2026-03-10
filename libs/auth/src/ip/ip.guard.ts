import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import * as ip from 'ip';
import { IpModuleOptions } from './ip-module-options.interface';

export const IP_MODULE_OPTIONS = 'IP_MODULE_OPTIONS';

/** IP 화이트리스트/블랙리스트 Guard. IpModule이 등록된 경우 @UseGuards(IpGuard)로 사용. */
@Injectable()
export class IpGuard implements CanActivate {
  constructor(
    @Inject(IP_MODULE_OPTIONS) private readonly options: IpModuleOptions,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const address = this.extractIp(request);

    // 블랙리스트는 whitelist 통과 여부와 무관하게 항상 차단
    const isBlacklisted = (this.options.blacklist ?? []).some((cidr) =>
      this.cidrContains(cidr, address),
    );
    if (isBlacklisted) {
      throw new ForbiddenException('Access denied');
    }

    // whitelist가 설정된 경우 포함된 IP만 허용
    const whitelist = this.options.whitelist ?? [];
    if (whitelist.length > 0) {
      const isWhitelisted = whitelist.some((cidr) => this.cidrContains(cidr, address));
      if (!isWhitelisted) {
        throw new ForbiddenException('Access denied');
      }
    }

    return true;
  }

  /** CloudFront → X-Forwarded-For → req.ip 순서로 클라이언트 IP 추출 */
  private extractIp(request: Request): string {
    const raw =
      request.headers['cloudfront-viewer-address'] ||
      request.headers['x-forwarded-for'] ||
      request.ip;
    return (typeof raw === 'string' ? raw : raw[0])
      .split(',')[0]
      .trim()
      .replace(/:\d+$/, ''); // IPv6-mapped IPv4 포트 제거
  }

  private cidrContains(cidr: string, address: string): boolean {
    try {
      return ip.cidrSubnet(cidr).contains(address);
    } catch {
      return false;
    }
  }
}
