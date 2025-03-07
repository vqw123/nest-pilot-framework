import { Injectable, INestApplication, Inject } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerMoudleOptions } from '../interface/swagger.interface';

@Injectable()
export class SwaggerService {
  constructor(@Inject(SWAGGER_OPTIONS) private readonly options: SwaggerMoudleOptions) {}

  setupSwagger(app: INestApplication, _options?: SwaggerMoudleOptions) {
    const options = _options ?? this.options;

    const builder = new DocumentBuilder()
      .setTitle(options.title)
      .setDescription(options.description)
      .setVersion(options.version);

    if (options.termsOfService) {
      builder.setTermsOfService(options.termsOfService);
    }

    if (options.contact) {
      builder.setContact(options.contact.name, options.contact.url, options.contact.email);
    }

    if (options.license) {
      builder.setLicense(options.license.name, options.license.url);
    }

    if (options.openApiVersion) {
      builder.setOpenAPIVersion(options.openApiVersion);
    }

    if (options.basePath) {
      builder.setBasePath(options.basePath);
    }

    if (options.externalDocs) {
      builder.setExternalDoc(options.externalDocs.description, options.externalDocs.url);
    }

    //`addServer()` 적용
    if (options.servers) {
      options.servers.forEach((server) => {
        builder.addServer(server.url, server.description, server.variables);
      });
    }

    //`addTag()` 적용
    if (options.tags) {
      options.tags.forEach((tag) => {
        builder.addTag(tag.name, tag.description, tag.externalDocs);
      });
    }

    //`addExtension()` 적용
    if (options.extensions) {
      options.extensions.forEach((extension) => {
        builder.addExtension(extension.key, extension.value);
      });
    }

    //`addSecurity()` 적용
    if (options.security) {
      options.security.forEach((security) => {
        builder.addSecurity(security.name, security.options);
        if (security.requirements) {
          builder.addSecurityRequirements({ [security.name]: security.requirements });
        }
      });
    }

    //`addGlobalParameters()` 적용
    if (options.globalParameters) {
      builder.addGlobalParameters(...options.globalParameters);
    }

    const document = SwaggerModule.createDocument(app, builder.build());
    SwaggerModule.setup(options.basePath || 'swagger', app, document, {
      swaggerOptions: {
        docExpansion: 'none',
        defaultModelsExpandDepth: -1,
        persistAuthorization: true,
        displayRequestDuration: true,
      },
    });
  }
}
