import { Body, Controller, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ProjectGuard } from '../../common/guard/project.guard';
import { SessionService } from '../../session/v1/session.service';
import { EmailService } from './email.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendEmailDto } from './dto/resend-email.dto';
import { SigninResponseDto } from '../../signin/v1/dto/signin-response.dto';

@ApiTags('email')
@Controller(':projectId/email')
@UseGuards(ProjectGuard)
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly sessionService: SessionService,
  ) {}

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '이메일 인증 코드 확인 → JWT + Refresh Token 발급' })
  @ApiOkResponse({ type: SigninResponseDto })
  async verify(
    @Param('projectId') projectId: string,
    @Body() dto: VerifyEmailDto,
  ): Promise<SigninResponseDto> {
    const uuid = await this.emailService.verify(dto.email, dto.code);
    return this.sessionService.createSession(uuid, projectId);
  }

  @Post('resend')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '인증 코드 재발송' })
  async resend(@Body() dto: ResendEmailDto): Promise<void> {
    await this.emailService.resend(dto.email);
  }
}
