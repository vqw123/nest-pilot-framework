import { PartialType } from '@nestjs/swagger';
import { CreateExampleDto } from './create-example.dto';

/** Example 수정 요청 DTO. CreateExampleDto의 모든 필드를 optional로 상속한다. */
export class UpdateExampleDto extends PartialType(CreateExampleDto) {}
