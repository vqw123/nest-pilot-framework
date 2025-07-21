import { NestFactory } from '@nestjs/core';
import { ExampleModule } from './example.module';
import { DatabaseExceptionFilter, HttpExceptionFilter } from '@libs/error';
import { GlobalExceptionFilter } from '@libs/error/filter/global.exception.filter';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@libs/config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(ExampleModule);

  /**
   * Error Handling Filter
   */
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new DatabaseExceptionFilter(),
    new GlobalExceptionFilter(),
  );

  const configService = app.get(ConfigService);
  const appName = configService.get<string>('app.name');
  const appVersion = configService.get<string>('app.version');
  const port = configService.get<number>('server.port');

  const logger = new Logger('Bootstrap');
  await app.listen(port);
  logger.log(`${appName} v${appVersion} is running on ${await app.getUrl()}`);
}

bootstrap();
