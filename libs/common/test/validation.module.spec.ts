import { ValidationModule } from '../src/validation/validation.module';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

describe('ValidationModule', () => {
  describe('forRoot', () => {
    it('should return a global DynamicModule', () => {
      const result = ValidationModule.forRoot();

      expect(result.global).toBe(true);
      expect(result.module).toBe(ValidationModule);
    });

    it('should register APP_PIPE provider', () => {
      const result = ValidationModule.forRoot();

      const pipeProvider = (result.providers as any[]).find(
        (p) => p.provide === APP_PIPE,
      );

      expect(pipeProvider).toBeDefined();
      expect(pipeProvider.useValue).toBeInstanceOf(ValidationPipe);
    });

    it('should pass options to ValidationPipe', () => {
      const result = ValidationModule.forRoot({
        whitelist: true,
        transform: true,
      });

      const pipeProvider = (result.providers as any[]).find(
        (p) => p.provide === APP_PIPE,
      );

      expect(pipeProvider.useValue).toBeInstanceOf(ValidationPipe);
    });

    it('should work without options', () => {
      const result = ValidationModule.forRoot();

      const pipeProvider = (result.providers as any[]).find(
        (p) => p.provide === APP_PIPE,
      );

      expect(pipeProvider.useValue).toBeInstanceOf(ValidationPipe);
    });
  });
});
