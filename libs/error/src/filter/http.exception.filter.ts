import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ResponseError } from '@libs/error/response-error';
import { CustomHttpException } from '../excetpion/custom.http.exception';
import { ErrorCode } from '../error-code';
import { EOL } from 'os';

@Catch(HttpException) // CustomHttpException도 포함됨
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // CustomHttpException인지 확인
    const errorResponse = exception.getResponse();
    let responseError: ResponseError;

    if (exception instanceof CustomHttpException && typeof errorResponse === 'object') {
      responseError = errorResponse as ResponseError;
    } else {
      this.logger.error(`${exception.name} : ${exception.message}${EOL}${exception.stack}`); // 내부 로그는 남김
      responseError = new ResponseError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'An unexpected error occurred.',
      );
    }

    response.status(exception.getStatus()).json(responseError.toJSON());
  }
}
