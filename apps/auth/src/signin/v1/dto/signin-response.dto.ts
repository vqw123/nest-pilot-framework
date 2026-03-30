import { ApiProperty } from '@nestjs/swagger';

export class SigninResponseDto {
  @ApiProperty({ description: 'RS256 JWT Access Token' })
  accessToken: string;

  @ApiProperty({ description: '세션 갱신용 Refresh Token (opaque UUID)' })
  refreshToken: string;
}
