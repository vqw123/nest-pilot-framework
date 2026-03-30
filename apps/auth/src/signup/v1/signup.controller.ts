import { Body, Controller, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse } from '@nestjs/swagger';
import { ProjectGuard } from '../../common/guard/project.guard';
import { SessionService } from '../../session/v1/session.service';
import { GoogleSigninService } from '../../signin/v1/service/google-signin.service';
import { EmailSignupService } from './service/email-signup.service';
import { GoogleSigninDto } from '../../signin/v1/dto/google-signin.dto';
import { SigninResponseDto } from '../../signin/v1/dto/signin-response.dto';
import { EmailSignupDto } from './dto/email-signup.dto';

@ApiTags('signup')
@Controller(':projectId/signup')
@UseGuards(ProjectGuard)
export class SignupController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly googleSigninService: GoogleSigninService,
    private readonly emailSignupService: EmailSignupService,
  ) {}

  @Post('google')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Google ID Token 회원가입 (이미 가입된 경우 409)' })
  @ApiCreatedResponse({ type: SigninResponseDto })
  async signUpWithGoogle(
    @Param('projectId') projectId: string,
    @Body() dto: GoogleSigninDto,
  ): Promise<SigninResponseDto> {
    const { uuid } = await this.googleSigninService.signUp(projectId, dto.idToken);
    return this.sessionService.createSession(uuid, projectId);
  }

  @Post('email')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '이메일 회원가입 (인증 메일 발송)' })
  @ApiCreatedResponse({ description: '가입 완료. 인증 코드를 이메일로 발송.' })
  async signUpWithEmail(
    @Param('projectId') projectId: string,
    @Body() dto: EmailSignupDto,
  ): Promise<void> {
    await this.emailSignupService.signUp(projectId, dto.email, dto.password);
  }
}
