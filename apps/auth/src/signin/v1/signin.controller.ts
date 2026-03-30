import { Body, Controller, Post, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ProjectGuard } from '../../common/guard/project.guard';
import { TokenService } from '../../token/v1/token.service';
import { GoogleSigninService } from './service/google-signin.service';
import { AppleSigninService } from './service/apple-signin.service';
import { EmailSigninService } from './service/email-signin.service';
import { GoogleSigninDto } from './dto/google-signin.dto';
import { EmailSigninDto } from './dto/email-signin.dto';
import { SigninResponseDto } from './dto/signin-response.dto';

@ApiTags('signin')
@Controller(':projectId/signin')
@UseGuards(ProjectGuard)
export class SigninController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly googleSigninService: GoogleSigninService,
    private readonly appleSigninService: AppleSigninService,
    private readonly emailSigninService: EmailSigninService,
  ) {}

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Google ID Token 로그인 (미가입 시 404)' })
  @ApiOkResponse({ type: SigninResponseDto })
  async signInWithGoogle(
    @Param('projectId') projectId: string,
    @Body() dto: GoogleSigninDto,
  ): Promise<SigninResponseDto> {
    const { uuid } = await this.googleSigninService.signIn(projectId, dto.idToken);
    return { accessToken: this.tokenService.sign(uuid, projectId) };
  }

  @Post('apple')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Apple 로그인 (미구현)' })
  @ApiOkResponse({ type: SigninResponseDto })
  async signInWithApple(
    @Param('projectId') projectId: string,
    @Body() dto: GoogleSigninDto,
  ): Promise<SigninResponseDto> {
    const { uuid } = await this.appleSigninService.signIn(projectId, dto.idToken);
    return { accessToken: this.tokenService.sign(uuid, projectId) };
  }

  @Post('email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '이메일 로그인' })
  @ApiOkResponse({ type: SigninResponseDto })
  async signInWithEmail(
    @Param('projectId') projectId: string,
    @Body() dto: EmailSigninDto,
  ): Promise<SigninResponseDto> {
    const { uuid } = await this.emailSigninService.signIn(projectId, dto.email, dto.password);
    return { accessToken: this.tokenService.sign(uuid, projectId) };
  }
}
