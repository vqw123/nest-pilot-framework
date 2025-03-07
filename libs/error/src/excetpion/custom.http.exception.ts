import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseError } from '../response-error';
import { ErrorCode } from '../error-code';

export class CustomHttpException extends HttpException {
  constructor(code: ErrorCode, message: string, status: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(new ResponseError(code, message), status);
  }
}
