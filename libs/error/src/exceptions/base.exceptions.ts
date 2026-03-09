import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorResponse } from '../responses/error.response';

export class BaseHttpException<T = string> extends HttpException {
  constructor(
    public readonly code: T,
    public readonly message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(new ErrorResponse(code, message), status);
    this.name = new.target.name;
  }
}

export class BaseDomainException<T = string> extends Error {
  constructor(
    public readonly code: T,
    public readonly message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}
