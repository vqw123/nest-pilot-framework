import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { TypeORMError } from 'typeorm';
import { ErrorCode } from '../error-code';
import { ResponseError } from '../response-error';
import { EOL } from 'os';

@Catch(TypeORMError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    this.logger.error(`${exception.name} : ${exception.message}${EOL}${exception.stack}`); // 내부 로그는 남김

    const resposneError = new ResponseError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'An unexpected database error occurred.',
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(resposneError.toJSON());
  }
}
