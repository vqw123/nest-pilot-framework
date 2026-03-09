import { DynamicModule, Module, ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

@Module({})
export class ValidationModule {
  static forRoot(options?: ValidationPipeOptions): DynamicModule {
    return {
      global: true,
      module: ValidationModule,
      providers: [
        {
          provide: APP_PIPE,
          useValue: new ValidationPipe(options),
        },
      ],
    };
  }
}
