import { ApiProperty } from '@nestjs/swagger';

export class SigninResponseDto {
  @ApiProperty({ description: 'RS256 JWT Access Token' })
  accessToken: string;}
