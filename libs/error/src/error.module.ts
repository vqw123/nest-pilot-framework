import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ErrorModuleOptions } from './interfaces/error-module-options.interface';
import { createGlobalFilterProviders, createFilterProviders } from './providers/error.providers';

@Module({})
export class ErrorModule {
  static forRoot(options: ErrorModuleOptions, isGlobal: boolean = true): DynamicModule {
    const providers: Provider[] = [
      ...createGlobalFilterProviders(),
      ...createFilterProviders(options),
      ...(options.customFilters ?? []),
    ];

    return {
      global: isGlobal,
      module: ErrorModule,
      providers,
    };
  }
}
