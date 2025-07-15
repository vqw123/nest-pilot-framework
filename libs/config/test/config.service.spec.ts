import { ConfigService } from '../src/services/config.service';

describe('ConfigService', () => {
  const mockConfig = {
    app: {
      name: 'test-app',
      version: '1.2.3',
    },
  };

  const service = new ConfigService(mockConfig as any);

  it('should get nested config values', () => {
    expect(service.get('app.name')).toBe('test-app');
    expect(service.get('app.version')).toBe('1.2.3');
  });

  it('should return undefined for invalid path', () => {
    expect(service.get('not.found')).toBeUndefined();
  });
});
