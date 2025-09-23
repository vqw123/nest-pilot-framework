import { Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { BaseErrorCode } from '../constants/base-error-code.constant';
import { BaseExceptionFilter } from './base-exception.filter';

@Catch()
export class GlobalExceptionFilter extends BaseExceptionFilter {
  constructor() {
    super(GlobalExceptionFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    this.handleUnknownException(
      exception,
      response,
      'Unexpected internal server error.',
      BaseErrorCode.INTERNAL_SERVER_ERROR,
    );
  }
}
