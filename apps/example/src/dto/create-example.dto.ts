import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/** Example 생성 요청 DTO. ValidationPipe에 의해 자동 검증된다. */
export class CreateExampleDto {
  @ApiProperty({ example: '예제 이름' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: '예제 설명' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
