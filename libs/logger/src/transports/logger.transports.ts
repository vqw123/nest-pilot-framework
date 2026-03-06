import * as winston from 'winston';
import * as Transport from 'winston-transport';

// NestJS Logger.error() 호출 시 stack 미전달이면 [undefined]가 자동으로 붙음 → 제거
const cleanNestStack = winston.format((info) => {
  if (
    info[Symbol.for('level')] === 'error' &&
    Array.isArray(info?.stack) &&
    info.stack.length === 1 &&
    info.stack[0] === undefined
  ) {
    const { stack: _, ...rest } = info;
    return rest;
  }
  return info;
});

export const createDefaultTransport = (): Transport => {
  return new winston.transports.Console({
    format: winston.format.combine(
      cleanNestStack(),
      winston.format.colorize({
        level: true,
      }),
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS',
      }),
      winston.format.ms(),
      winston.format.printf((info) => {
        const { timestamp, level, message, context, ms, ...meta } = info;
        const metaString = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
        return `[${timestamp}] ${level} (${context || 'Unknown'}) - ${message ?? ''}${metaString} ${ms}`;
      }),
    ),
  });
};
