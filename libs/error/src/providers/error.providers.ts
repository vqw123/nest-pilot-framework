import { Provider } from '@nestjs/common';
import { GlobalExceptionFilter } from '../filters/global-exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from '../filters/http-exception.filter';

export const createDefaultFilterProviders = (): Provider[] => {
  const providers: Provider[] = [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ];

  return providers;
};
