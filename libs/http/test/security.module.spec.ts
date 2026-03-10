import { SecurityModule } from '../src/security/security.module';

describe('SecurityModule', () => {
  describe('forRoot', () => {
    it('should return a global DynamicModule', () => {
      const result = SecurityModule.forRoot();

      expect(result.global).toBe(true);
      expect(result.module).toBe(SecurityModule);
    });

    it('should register SECURITY_MODULE_OPTIONS provider', () => {
      const result = SecurityModule.forRoot({ helmet: {}, cors: { origin: '*' } });

      expect(result.providers).toHaveLength(1);
    });

    it('should work with empty options', () => {
      const result = SecurityModule.forRoot();

      expect(result.global).toBe(true);
    });

    it('should work with helmet only', () => {
      const result = SecurityModule.forRoot({ helmet: { frameguard: false } });

      expect(result.global).toBe(true);
    });

    it('should work with cors only', () => {
      const result = SecurityModule.forRoot({ cors: { origin: 'https://example.com' } });

      expect(result.global).toBe(true);
    });
  });
});
