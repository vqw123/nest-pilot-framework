import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TokenService } from './token.service';
import { ProjectGuard } from '../../common/guard/project.guard';

@ApiTags('token')
@Controller(':projectId/token')
@UseGuards(ProjectGuard)
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('public-key')
  @ApiOperation({ summary: 'RSA 공개키 조회 (JWK 형식)' })
  @ApiOkResponse({ description: 'JWK 형식의 RSA 공개키' })
  getPublicKey(): Record<string, any> {
    return this.tokenService.getPublicKeyJwk();
  }
}
