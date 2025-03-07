import { Provider, ValueProvider } from '@nestjs/common';
import { SwaggerModuleAsyncOptions, SwaggerMoudleOptions } from '../interface/swagger.interface';

export const createOptionsProvider = (
  options: SwaggerMoudleOptions,
): ValueProvider<SwaggerMoudleOptions> => ({
  provide: SWAGGER_OPTIONS,
  useValue: options,
});

export const createAsyncOptionsProvider = (options: SwaggerModuleAsyncOptions): Provider => {
  if (options.useFactory) {
    return {
      provide: SWAGGER_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject,
    };
  }

  return {
    provide: SWAGGER_OPTIONS,
    useValue: {},
  };
};

export const createAsyncProviders = (options: SwaggerModuleAsyncOptions): Provider[] => {
  if (options.useFactory) return [createAsyncOptionsProvider(options)];

  return [];
};
