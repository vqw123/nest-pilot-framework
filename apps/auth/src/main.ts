import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { HttpLoggerInterceptor } from '@libs/logger';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);

  app.useGlobalInterceptors(new HttpLoggerInterceptor());

  await app.listen(process.env.port ?? 3000);
}
bootstrap();
