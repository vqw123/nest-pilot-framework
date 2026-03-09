import { NestFactory } from '@nestjs/core';
import { ExampleModule } from './example.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@libs/config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(ExampleModule);

  const configService = app.get(ConfigService);
  const appName = configService.get<string>('app.name');
  const appVersion = configService.get<string>('app.version');
  const port = configService.get<number>('server.port');

  // SIGTERM 수신 시 HealthModule의 TerminationService.onModuleDestroy()가 호출되어
  // readiness 엔드포인트가 503을 반환하고 로드밸런서에서 Pod이 제외됩니다.
  // K8s deployment의 terminationGracePeriodSeconds 동안 in-flight 요청을 처리 후 종료됩니다.
  app.enableShutdownHooks();

  const logger = new Logger('Bootstrap');
  await app.listen(port);
  logger.log(`${appName} v${appVersion} is running on ${await app.getUrl()}`);
}

bootstrap();
