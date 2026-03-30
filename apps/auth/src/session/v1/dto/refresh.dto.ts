import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({ description: '세션 갱신용 Refresh Token' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
