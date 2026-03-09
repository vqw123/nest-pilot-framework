import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { BaseHttpException } from '../exceptions/base.exceptions';
import { BaseExceptionFilter } from './base-exception.filter';
import { ErrorResponse } from '../responses/error.response';

@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter<HttpException> {
  constructor() {
    super(HttpExceptionFilter.name);
  }

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const errorResponse = exception.getResponse();

    if (
      exception instanceof BaseHttpException &&
      typeof errorResponse === 'object' &&
      errorResponse instanceof ErrorResponse
    ) {
      response.status(exception.getStatus()).json((errorResponse as ErrorResponse).getResponse());
    } else {
      response.status(exception.getStatus()).json(errorResponse);
    }
  }
}
