import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiNoContentResponse } from '@nestjs/swagger';
import { SessionService } from './session.service';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutDto } from './dto/logout.dto';
import { SigninResponseDto } from '../../signin/v1/dto/signin-response.dto';

@ApiTags('session')
@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  /**
   * Refresh token으로 새 access token + refresh token을 발급한다.
   * 기존 refresh token은 즉시 폐기된다 (token rotation).
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh token으로 세션 갱신' })
  @ApiOkResponse({ type: SigninResponseDto })
  async refresh(@Body() dto: RefreshDto): Promise<SigninResponseDto> {
    return this.sessionService.refreshSession(dto.refreshToken);
  }

  /**
   * Refresh token을 폐기해 세션을 종료한다 (로그아웃).
   */
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '로그아웃 (refresh token 폐기)' })
  @ApiNoContentResponse()
  async logout(@Body() dto: LogoutDto): Promise<void> {
    await this.sessionService.revokeSession(dto.refreshToken);
  }
}
