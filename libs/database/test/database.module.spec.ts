import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../src/database.module';

describe('DatabaseModule', () => {
  describe('forRoot', () => {
    it('should return a global DynamicModule', () => {
      const result = DatabaseModule.forRoot({ type: 'postgres' });

      expect(result.global).toBe(true);
      expect(result.module).toBe(DatabaseModule);
      expect(result.imports).toHaveLength(1);
    });
  });

  describe('forRootAsync', () => {
    it('should return a global DynamicModule', () => {
      const result = DatabaseModule.forRootAsync({
        useFactory: () => ({ type: 'postgres' }),
      });

      expect(result.global).toBe(true);
      expect(result.module).toBe(DatabaseModule);
      expect(result.imports).toHaveLength(1);
    });

    it('should pass inject to useFactory', () => {
      const TOKEN = 'SOME_TOKEN';
      const result = DatabaseModule.forRootAsync({
        useFactory: () => ({ type: 'postgres' }),
        inject: [TOKEN],
      });

      expect(result.global).toBe(true);
    });

    it('should default inject to empty array when not provided', () => {
      const result = DatabaseModule.forRootAsync({
        useFactory: () => ({ type: 'postgres' }),
      });

      expect(result.global).toBe(true);
    });
  });

  describe('forFeature', () => {
    it('should return a DynamicModule that exports TypeOrmModule', () => {
      const result = DatabaseModule.forFeature([]);

      expect(result.module).toBe(DatabaseModule);
      expect(result.exports).toContain(TypeOrmModule);
    });

    it('should not be global', () => {
      const result = DatabaseModule.forFeature([]);

      expect(result.global).toBeUndefined();
    });
  });
});
