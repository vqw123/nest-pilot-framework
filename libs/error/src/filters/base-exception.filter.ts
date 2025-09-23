import { ExceptionFilter, ArgumentsHost, Logger, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { EOL } from 'os';
import { ErrorResponse } from '../responses/error.response';
import { BaseErrorCode } from '../constants/base-error-code.constant';

export abstract class BaseExceptionFilter<T = unknown> implements ExceptionFilter<T> {
  protected readonly logger: Logger;

  constructor(contextName: string) {
    this.logger = new Logger(contextName);
  }

  abstract catch(exception: T, host: ArgumentsHost): void;

  protected handleUnknownException(
    exception: unknown,
    response: Response,
    message = 'Unexpected error occurred.',
    code = BaseErrorCode.INTERNAL_SERVER_ERROR,
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR,
  ): void {
    if (exception instanceof Error) {
      this.logger.error(`${exception.name}: ${exception.message}${EOL}${exception.stack}`);
    } else {
      this.logger.error(`Unknown exception: ${JSON.stringify(exception)}`);
    }

    const responseBody = new ErrorResponse(code, message);
    response.status(statusCode).json(responseBody.getResponse());
  }
}
