import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExampleEntity } from '../entity/example.entity';

/**
 * Example 응답 DTO.
 * 클라이언트에 노출할 필드와 Swagger 문서를 이 계층에서 관리한다.
 * Entity를 직접 반환하지 않음으로써 DB 스키마 변경이 API 계약에 즉시 영향을 주는 것을 방지한다.
 */
export class ExampleResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '예제 이름' })
  name: string;

  @ApiPropertyOptional({ example: '예제 설명' })
  description: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  /** ExampleEntity를 ResponseDto로 변환한다. */
  static from(entity: ExampleEntity): ExampleResponseDto {
    const dto = new ExampleResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
