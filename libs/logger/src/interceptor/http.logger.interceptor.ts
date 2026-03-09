import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { RequestContext } from '@libs/common';
import { RequestUtil } from '@libs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class HttpLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpLoggerInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return new Observable((subscriber) => {
      RequestContext.run(() => {
        const request = context.switchToHttp().getRequest();
        const requestId = (request.headers['x-correlation-id'] as string) ?? randomUUID();
        RequestContext.set('requestId', requestId);
        const ip = RequestUtil.getClientIp(request);
        const country = RequestUtil.getClientCountry(request);
        RequestContext.set('ip', ip);
        RequestContext.set('country', country);

        const { method, url } = request;
        const body = request.body ?? {};
        const query = request.query ?? {};
        const start = Date.now();

        const logData: Record<string, any> = {};
        if (Object.keys(body).length) logData.body = body;
        if (Object.keys(query).length) logData.query = query;

        const countryLog = country && country !== 'UNKNOWN_COUNTRY' ? `(${country})` : '';

        this.logger.log(
          `[${requestId}] Request from ${ip}${countryLog} - ${method} ${url} ${Object.keys(logData).length ? '- ' + JSON.stringify(logData) : ''}`,
        );

        next
          .handle()
          .pipe(
            tap((responseData) => {
              const duration = Date.now() - start;
              const response = context.switchToHttp().getResponse();
              const statusCode = response.statusCode;

              // 응답 데이터가 없거나 빈 객체 `{}`일 경우 로깅 제외
              const responseLog =
                responseData && Object.keys(responseData).length
                  ? `- Response : ${JSON.stringify(responseData)}`
                  : '';

              this.logger.log(
                `[${requestId}] Response to ${ip}${countryLog} - ${method} ${url} - Status: ${statusCode} - Duration: ${duration}ms ${responseLog}`,
              );
            }),
          )
          .subscribe({
            next: (data) => subscriber.next(data),
            error: (err) => subscriber.error(err),
            complete: () => subscriber.complete(),
          });
      });
    });
  }
}
