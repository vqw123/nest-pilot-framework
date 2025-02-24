import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ResponseError } from '@libs/error/response-error';
import { EOL } from 'os';
import { ErrorCode } from '../error-code';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof Error) {
      this.logger.error(`${exception.name} : ${exception.message}${EOL}${exception.stack}`); // 내부 로그는 남김
    } else {
      this.logger.error(exception);
    }

    // 기본 응답 구조 생성
    const responseError = new ResponseError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'An unexpected error occurred.',
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(responseError.toJSON());
  }
}
