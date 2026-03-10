import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TokenService } from './token.service';

/**
 * RFC 7517 JWKS endpoint.
 * GET /api/v1/auth/.well-known/jwks.json
 *
 * 다른 서비스나 CDN이 공개키를 fetch하는 표준 endpoint.
 * ProjectGuard 없이 공개 접근 가능.
 */
@ApiTags('well-known')
@Controller('.well-known')
export class WellKnownController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('jwks.json')
  @ApiOperation({ summary: 'JWKS endpoint (RFC 7517)' })
  @ApiOkResponse({ description: '{ keys: [JWK] } 형식의 공개키 목록' })
  getJwks(): { keys: Record<string, string>[] } {
    return { keys: [this.tokenService.getPublicKeyJwk()] };
  }
}
