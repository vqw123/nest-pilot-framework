import { DynamicModule, Global, Module, Logger } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as Transport from 'winston-transport';

@Global()
@Module({})
export class LoggerModule {
  static forRoot(): DynamicModule {
    const transports: Transport[] = [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize({
            level: true,
          }),
          winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss.SSS',
          }),
          winston.format.printf((info) => {
            const { timestamp, level, message, context, ...meta } = info;
            const metaString = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
            return `[${timestamp}] ${level} (${context || 'Unknown'}) - ${message ?? ''}${metaString}`;
          }),
        ),
      }),
    ];

    const winstonLogger = WinstonModule.createLogger({
      transports,
    });

    Logger.overrideLogger(winstonLogger); // NestJS Logger를 winston으로 교체

    return {
      module: LoggerModule,
      providers: [
        {
          provide: Logger,
          useValue: winstonLogger,
        },
      ],
      exports: [Logger], // 다른 모듈에서 사용할 수 있도록 export
    };
  }
}
