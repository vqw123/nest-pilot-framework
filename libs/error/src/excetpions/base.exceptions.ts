import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorResponse } from '../responses/error.response';

export class BaseHttpException<T = number> extends HttpException {
  constructor(
    public readonly code: T,
    public readonly message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly metadata?: Record<string, unknown>,
  ) {
    super(new ErrorResponse(code, message), status);
    this.name = new.target.name;
  }
}

export class BaseDomainException<T = number> extends Error {
  constructor(
    public readonly code: T,
    public readonly message: string,
    public readonly status?: HttpStatus,
    public readonly metadata?: Record<string, unknown>,
  ) {
    super(message);
    this.name = new.target.name;
  }
}
