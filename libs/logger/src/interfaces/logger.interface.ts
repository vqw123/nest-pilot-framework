import {
  InjectionToken,
  ModuleMetadata,
  OptionalFactoryDependency,
  Provider,
} from '@nestjs/common';
import * as Transport from 'winston-transport';

export interface LoggerModuleOptions {
  transports?: Transport[];
  enableHttpInterceptor?: boolean;
}

export interface LoggerModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => LoggerModuleOptions | Promise<LoggerModuleOptions>;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
  extraProviders?: Provider[];
}
