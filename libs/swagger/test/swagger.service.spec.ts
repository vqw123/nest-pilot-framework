import { SwaggerService } from '../src/service/swagger.service';
import { SwaggerModule as NestSwaggerModule, DocumentBuilder } from '@nestjs/swagger';

jest.mock('@nestjs/swagger', () => ({
  DocumentBuilder: jest.fn().mockImplementation(() => ({
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    addServer: jest.fn().mockReturnThis(),
    addTag: jest.fn().mockReturnThis(),
    addBearerAuth: jest.fn().mockReturnThis(),
    addBasicAuth: jest.fn().mockReturnThis(),
    addApiKey: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({}),
  })),
  SwaggerModule: {
    createDocument: jest.fn().mockReturnValue({}),
    setup: jest.fn(),
  },
}));

describe('SwaggerService', () => {
  let service: SwaggerService;
  const mockApp = {} as any;

  afterEach(() => jest.clearAllMocks());

  const getBuilder = () => (DocumentBuilder as jest.Mock).mock.results[0].value;

  describe('setup', () => {
    it('should use default path "docs"', () => {
      service = new SwaggerService({ title: 'Test', description: 'Test', version: '1.0' });
      service.setup(mockApp);

      expect(NestSwaggerModule.setup).toHaveBeenCalledWith('docs', mockApp, {}, expect.any(Object));
    });

    it('should use custom path when provided', () => {
      service = new SwaggerService({ title: 'Test', description: 'Test', version: '1.0', path: 'api-docs' });
      service.setup(mockApp);

      expect(NestSwaggerModule.setup).toHaveBeenCalledWith('api-docs', mockApp, {}, expect.any(Object));
    });

    it('should add servers when provided', () => {
      service = new SwaggerService({
        title: 'Test', description: 'Test', version: '1.0',
        servers: [{ url: 'https://test.com', description: 'Production' }],
      });
      service.setup(mockApp);

      expect(getBuilder().addServer).toHaveBeenCalledWith('https://test.com', 'Production', undefined);
    });

    it('should add tags when provided', () => {
      service = new SwaggerService({
        title: 'Test', description: 'Test', version: '1.0',
        tags: [{ name: 'auth', description: '인증' }],
      });
      service.setup(mockApp);

      expect(getBuilder().addTag).toHaveBeenCalledWith('auth', '인증', undefined);
    });

    describe('auth - bearer', () => {
      it('should add bearer auth with default name when true', () => {
        service = new SwaggerService({
          title: 'Test', description: 'Test', version: '1.0',
          auth: { bearer: true },
        });
        service.setup(mockApp);

        expect(getBuilder().addBearerAuth).toHaveBeenCalledWith(undefined, 'bearer');
      });

      it('should add bearer auth with full SecuritySchemeObject options', () => {
        service = new SwaggerService({
          title: 'Test', description: 'Test', version: '1.0',
          auth: {
            bearer: {
              name: 'Authentication',
              options: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter JWT token',
                in: 'header',
              },
            },
          },
        });
        service.setup(mockApp);

        expect(getBuilder().addBearerAuth).toHaveBeenCalledWith(
          expect.objectContaining({ bearerFormat: 'JWT', description: 'Enter JWT token' }),
          'Authentication',
        );
      });
    });

    describe('auth - basic', () => {
      it('should add basic auth with default name when true', () => {
        service = new SwaggerService({
          title: 'Test', description: 'Test', version: '1.0',
          auth: { basic: true },
        });
        service.setup(mockApp);

        expect(getBuilder().addBasicAuth).toHaveBeenCalledWith(undefined, 'basic');
      });

      it('should add basic auth with custom options', () => {
        service = new SwaggerService({
          title: 'Test', description: 'Test', version: '1.0',
          auth: {
            basic: {
              name: 'Secretkey',
              options: {
                type: 'http',
                scheme: 'basic',
                description: 'Enter secret key',
                in: 'header',
              },
            },
          },
        });
        service.setup(mockApp);

        expect(getBuilder().addBasicAuth).toHaveBeenCalledWith(
          expect.objectContaining({ description: 'Enter secret key' }),
          'Secretkey',
        );
      });
    });

    describe('auth - apiKey', () => {
      it('should add api key auth with default name', () => {
        service = new SwaggerService({
          title: 'Test', description: 'Test', version: '1.0',
          auth: {
            apiKey: {
              options: { type: 'apiKey', name: 'X-API-Key', in: 'header' },
            },
          },
        });
        service.setup(mockApp);

        expect(getBuilder().addApiKey).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'X-API-Key', in: 'header' }),
          'api-key',
        );
      });

      it('should add api key auth with custom name', () => {
        service = new SwaggerService({
          title: 'Test', description: 'Test', version: '1.0',
          auth: {
            apiKey: {
              name: 'my-api-key',
              options: { type: 'apiKey', name: 'X-API-Key', in: 'header' },
            },
          },
        });
        service.setup(mockApp);

        expect(getBuilder().addApiKey).toHaveBeenCalledWith(expect.any(Object), 'my-api-key');
      });
    });

    it('should support bearer and basic simultaneously', () => {
      service = new SwaggerService({
        title: 'Test', description: 'Test', version: '1.0',
        auth: { bearer: true, basic: true },
      });
      service.setup(mockApp);

      expect(getBuilder().addBearerAuth).toHaveBeenCalled();
      expect(getBuilder().addBasicAuth).toHaveBeenCalled();
    });
  });
});
