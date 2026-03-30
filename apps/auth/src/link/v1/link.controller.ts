import { Controller, Delete, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiNoContentResponse } from '@nestjs/swagger';
import { ProjectGuard } from '../../common/guard/project.guard';
import { BearerGuard, CurrentUser, JwtPayload } from '@libs/auth';
import { LinkService } from './link.service';
import { GoogleSigninService } from '../../signin/v1/service/google-signin.service';
import { LinkSocialDto } from './dto/link.dto';
import { Body } from '@nestjs/common';
import { Provider } from '../../entity/provider.enum';

@ApiTags('link')
@ApiBearerAuth()
@Controller(':projectId/link')
@UseGuards(ProjectGuard, BearerGuard)
export class LinkController {
  constructor(
    private readonly linkService: LinkService,
    private readonly googleSigninService: GoogleSigninService,
  ) {}

  @Post('google')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Google 계정 연동' })
  @ApiNoContentResponse()
  async linkGoogle(
    @Param('projectId') projectId: string,
    @Body() dto: LinkSocialDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    const profile = await this.googleSigninService.verifyIdToken(projectId, dto.idToken);
    await this.linkService.linkSocial(user.sub, Provider.GOOGLE, profile.providerUserId);
  }

  @Delete('google')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Google 계정 연동 해제' })
  @ApiNoContentResponse()
  async unlinkGoogle(@CurrentUser() user: JwtPayload): Promise<void> {
    await this.linkService.unlinkSocial(user.sub, Provider.GOOGLE);
  }
}
