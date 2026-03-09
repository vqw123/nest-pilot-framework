import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ErrorModuleOptions } from './interfaces/error-module-options.interface';
import { createDefaultFilterProviders } from './providers/error.providers';

@Module({})
export class ErrorModule {
  static forRoot(options?: ErrorModuleOptions): DynamicModule {
    const providers: Provider[] = [
      ...createDefaultFilterProviders(),
      ...(options?.customFilters ?? []),
    ];

    return {
      global: true,
      module: ErrorModule,
      providers,
    };
  }
}
