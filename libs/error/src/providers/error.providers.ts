import { Provider } from '@nestjs/common';
import { GlobalExceptionFilter } from '../filters/global-exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { ErrorModuleOptions } from '../interfaces/error-module-options.interface';
import { ErrorFilterClassMap } from '../constants/error-filter.constants';

export const createFilterProviders = (options: ErrorModuleOptions): Provider[] => {
  const uniqueProviders = new Set<Provider>();

  for (const type of options?.filters ?? []) {
    const filterClass = ErrorFilterClassMap[type];
    if (filterClass) {
      uniqueProviders.add(filterClass);
      uniqueProviders.add({
        provide: APP_FILTER,
        useClass: filterClass,
      });
    }
  }

  return Array.from(uniqueProviders);
};

export const createGlobalFilterProviders = (): Provider[] => {
  const providers: Provider[] = [
    GlobalExceptionFilter,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ];

  return providers;
};
