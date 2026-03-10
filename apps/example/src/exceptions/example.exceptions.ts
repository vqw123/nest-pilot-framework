import { HttpStatus } from '@nestjs/common';
import { BaseHttpException } from '@libs/error';

/**
 * Example 도메인 에러 코드.
 * BaseHttpException과 함께 사용하며, ErrorModule의 GlobalExceptionFilter가
 * 이를 일관된 에러 응답 형태로 직렬화한다.
 */
export enum ExampleErrorCode {
  NOT_FOUND = 'EXAMPLE_NOT_FOUND',
}

export class ExampleNotFoundException extends BaseHttpException<ExampleErrorCode> {
  constructor(id: number) {
    super(ExampleErrorCode.NOT_FOUND, `Example #${id} not found`, HttpStatus.NOT_FOUND);
  }
}
