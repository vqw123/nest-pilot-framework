import { Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { BaseExceptionFilter } from './base-exception.filter';
import { BaseDomainException } from '../excetpions/base.exceptions';
import { ErrorResponse } from '../responses/error.response';

@Catch(BaseDomainException)
export class DomainExceptionFilter extends BaseExceptionFilter<BaseDomainException> {
  constructor() {
    super(DomainExceptionFilter.name);
  }

  catch(exception: BaseDomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const errorResponse = new ErrorResponse(exception.code, exception.message);

    const status = exception?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const errorCode = exception.code;

    if (exception instanceof BaseDomainException) {
      response.status(status).json(errorResponse.getResponse());
    } else {
      this.handleUnknownException(
        exception,
        response,
        'Unexpected Domain error occurred.',
        errorCode,
        status,
      );
    }
  }
}
