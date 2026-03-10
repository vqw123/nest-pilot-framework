import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { BasicModuleOptions } from './basic-module-options.interface';

export const BASIC_MODULE_OPTIONS = 'BASIC_MODULE_OPTIONS';

/** Basic Auth Guard. BasicModule이 등록된 경우 @UseGuards(BasicGuard)로 사용. */
@Injectable()
export class BasicGuard implements CanActivate {
  constructor(
    @Inject(BASIC_MODULE_OPTIONS) private readonly options: BasicModuleOptions,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Basic ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const encoded = authorization.slice(6);
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
    const colonIndex = decoded.indexOf(':');

    if (colonIndex === -1) {
      throw new UnauthorizedException('Invalid Basic auth format');
    }

    const username = decoded.slice(0, colonIndex);
    const password = decoded.slice(colonIndex + 1);

    const isValid = await this.options.validate(username, password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return true;
  }
}
