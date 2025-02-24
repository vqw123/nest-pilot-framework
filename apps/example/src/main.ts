import { NestFactory } from '@nestjs/core';
import { ExampleModule } from './example.module';
import { HttpLoggerInterceptor } from '@libs/logger';
import { DatabaseExceptionFilter, HttpExceptionFilter } from '@libs/error';
import { GlobalExceptionFilter } from '@libs/error/filter/global.exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(ExampleModule);

  /**
   * Request & Response Logging
   */
  app.useGlobalInterceptors(new HttpLoggerInterceptor());

  /**
   * Error Handling Filter
   */
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new DatabaseExceptionFilter(),
    new GlobalExceptionFilter(),
  );

  await app.listen(process.env.port ?? 3000);
}

bootstrap();
