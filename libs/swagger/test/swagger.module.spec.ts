import { SwaggerModule } from '../src/swagger.module';
import { SwaggerService } from '../src/service/swagger.service';

describe('SwaggerModule', () => {
  describe('forRoot', () => {
    it('should return a global DynamicModule', () => {
      const result = SwaggerModule.forRoot({
        title: 'Test API',
        description: 'Test',
        version: '1.0',
      });

      expect(result.global).toBe(true);
      expect(result.module).toBe(SwaggerModule);
    });

    it('should register SwaggerService as provider and export', () => {
      const result = SwaggerModule.forRoot({
        title: 'Test API',
        description: 'Test',
        version: '1.0',
      });

      expect(result.providers).toContain(SwaggerService);
      expect(result.exports).toContain(SwaggerService);
    });
  });

  describe('forRootAsync', () => {
    it('should return a global DynamicModule', () => {
      const result = SwaggerModule.forRootAsync({
        useFactory: () => ({
          title: 'Test API',
          description: 'Test',
          version: '1.0',
        }),
      });

      expect(result.global).toBe(true);
      expect(result.module).toBe(SwaggerModule);
    });

    it('should register SwaggerService as provider and export', () => {
      const result = SwaggerModule.forRootAsync({
        useFactory: () => ({
          title: 'Test API',
          description: 'Test',
          version: '1.0',
        }),
      });

      expect(result.providers).toContain(SwaggerService);
      expect(result.exports).toContain(SwaggerService);
    });
  });
});
