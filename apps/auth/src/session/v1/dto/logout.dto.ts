import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LogoutDto {
  @ApiProperty({ description: '폐기할 Refresh Token' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
