import { Controller, Delete, HttpCode, HttpStatus, Post, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiNoContentResponse } from '@nestjs/swagger';
import { BearerGuard, CurrentUser, JwtPayload } from '@libs/auth';
import { LinkService } from './link.service';
import { GoogleSigninService } from '../../signin/v1/service/google-signin.service';
import { LinkSocialDto } from './dto/link.dto';
import { Provider } from '../../entity/provider.enum';

/**
 * 계정 연동/해제 API — 프로젝트와 무관한 계정 전역(account-global) 작업이다.
 * projectId 경로 파라미터 없이 Bearer JWT로 계정을 식별한다.
 * Google OAuth 설정 조회에는 JWT audience(aud)에 담긴 projectId를 사용한다.
 */
@ApiTags('account/link')
@ApiBearerAuth()
@Controller('account/link')
@UseGuards(BearerGuard)
export class LinkController {
  constructor(
    private readonly linkService: LinkService,
    private readonly googleSigninService: GoogleSigninService,
  ) {}

  @Post('google')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Google 계정 연동 (account-global)' })
  @ApiNoContentResponse()
  async linkGoogle(
    @Body() dto: LinkSocialDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    const profile = await this.googleSigninService.verifyIdToken(user.aud, dto.idToken);
    await this.linkService.linkSocial(user.sub, Provider.GOOGLE, profile.providerUserId);
  }

  @Delete('google')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Google 계정 연동 해제 (account-global)' })
  @ApiNoContentResponse()
  async unlinkGoogle(@CurrentUser() user: JwtPayload): Promise<void> {
    await this.linkService.unlinkSocial(user.sub, Provider.GOOGLE);
  }
}
