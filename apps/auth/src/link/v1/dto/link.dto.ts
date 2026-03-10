import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LinkSocialDto {
  @ApiProperty({ description: 'Google Sign-In SDK에서 발급받은 ID Token' })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
