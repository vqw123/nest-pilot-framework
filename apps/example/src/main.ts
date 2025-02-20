import { NestFactory } from '@nestjs/core';
import { ExampleModule } from './example.module';
import { HttpLoggerInterceptor } from '@libs/logger';

async function bootstrap() {
  const app = await NestFactory.create(ExampleModule);

  app.useGlobalInterceptors(new HttpLoggerInterceptor());

  await app.listen(process.env.port ?? 3000);
}
bootstrap();
