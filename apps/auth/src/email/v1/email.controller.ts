import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ProjectGuard } from '../../common/guard/project.guard';
import { TokenService } from '../../token/v1/token.service';
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
    private readonly tokenService: TokenService,
  ) {}

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '이메일 인증 코드 확인 → JWT 발급' })
  @ApiOkResponse({ type: SigninResponseDto })
  async verify(@Body() dto: VerifyEmailDto): Promise<SigninResponseDto> {
    const uid = await this.emailService.verify(dto.email, dto.code);
    return { accessToken: this.tokenService.sign(uid) };
  }

  @Post('resend')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '인증 코드 재발송' })
  async resend(@Body() dto: ResendEmailDto): Promise<void> {
    await this.emailService.resend(dto.email);
  }
}
