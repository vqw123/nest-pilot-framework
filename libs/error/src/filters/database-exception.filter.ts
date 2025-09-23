import { Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { TypeORMError } from 'typeorm';
import { BaseErrorCode } from '../constants/base-error-code.constant';
import { BaseExceptionFilter } from './base-exception.filter';

@Catch(TypeORMError)
export class DatabaseExceptionFilter extends BaseExceptionFilter<TypeORMError> {
  constructor() {
    super(DatabaseExceptionFilter.name);
  }

  catch(exception: TypeORMError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    this.handleUnknownException(
      exception,
      response,
      'A database error occurred.',
      BaseErrorCode.INTERNAL_SERVER_ERROR,
    );
  }
}
