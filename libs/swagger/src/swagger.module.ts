import { DynamicModule, Module, Provider } from '@nestjs/common';
import { SwaggerModuleAsyncOptions, SwaggerMoudleOptions } from './interface/swagger.interface';
import { SwaggerService } from './service/swagger.service';
import { createAsyncProviders, createOptionsProvider } from './provider/swagger.provider';

@Module({})
export class SwaggerModule {
  static forRoot(options: SwaggerMoudleOptions, isGlobal = true): DynamicModule {
    const providers: Provider[] = [createOptionsProvider(options), SwaggerService];

    return {
      global: isGlobal,
      module: SwaggerModule,
      providers,
      exports: [SwaggerService],
    };
  }

  static forRootAsync(options: SwaggerModuleAsyncOptions, isGlobal = true): DynamicModule {
    if (!options.useFactory) {
      throw new Error(`Swagger configuration error`);
    }

    const providers: Provider[] = [
      ...createAsyncProviders(options),
      SwaggerService,
      ...(options.extraProviders ?? []),
    ];

    return {
      global: isGlobal,
      module: SwaggerModule,
      imports: options.imports,
      providers,
      exports: [SwaggerService],
    };
  }
}
