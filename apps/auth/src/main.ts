import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { ConfigService } from '@libs/config';
import { SwaggerService } from '@libs/swagger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AuthModule);

  const configService = app.get(ConfigService);
  const appName = configService.get<string>('app.name');
  const appVersion = configService.get<string>('app.version');
  const port = configService.get<number>('server.port');

  app.setGlobalPrefix('api/v1/auth');
  app.enableShutdownHooks();
  app.get(SwaggerService).setup(app);

  const logger = new Logger('Bootstrap');
  await app.listen(port);
  logger.log(`${appName} v${appVersion} is running on ${await app.getUrl()}`);
}

bootstrap();
