import { DynamicModule, Module, Provider } from '@nestjs/common';
import { SwaggerModuleAsyncOptions, SwaggerModuleOptions } from './interface/swagger.interface';
import { SwaggerService } from './service/swagger.service';
import { createOptionsProvider, createAsyncOptionsProvider } from './provider/swagger.provider';

@Module({})
export class SwaggerModule {
  static forRoot(options: SwaggerModuleOptions): DynamicModule {
    return {
      global: true,
      module: SwaggerModule,
      providers: [createOptionsProvider(options), SwaggerService],
      exports: [SwaggerService],
    };
  }

  static forRootAsync(options: SwaggerModuleAsyncOptions): DynamicModule {
    const providers: Provider[] = [
      createAsyncOptionsProvider(options),
      SwaggerService,
      ...(options.extraProviders ?? []),
    ];

    return {
      global: true,
      module: SwaggerModule,
      imports: options.imports,
      providers,
      exports: [SwaggerService],
    };
  }
}
