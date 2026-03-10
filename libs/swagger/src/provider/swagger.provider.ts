import { Provider, ValueProvider } from '@nestjs/common';
import { SWAGGER_OPTIONS } from '../swagger.constant';
import { SwaggerModuleAsyncOptions, SwaggerModuleOptions } from '../interface/swagger.interface';

export const createOptionsProvider = (
  options: SwaggerModuleOptions,
): ValueProvider<SwaggerModuleOptions> => ({
  provide: SWAGGER_OPTIONS,
  useValue: options,
});

export const createAsyncOptionsProvider = (options: SwaggerModuleAsyncOptions): Provider => ({
  provide: SWAGGER_OPTIONS,
  useFactory: options.useFactory,
  inject: options.inject,
});
