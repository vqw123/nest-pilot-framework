import { Injectable, INestApplication, Inject } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SWAGGER_OPTIONS } from '../swagger.constant';
import { SwaggerModuleOptions, SwaggerAuthScheme } from '../interface/swagger.interface';

@Injectable()
export class SwaggerService {
  constructor(@Inject(SWAGGER_OPTIONS) private readonly options: SwaggerModuleOptions) {}

  setup(app: INestApplication): void {
    const {
      title, description, version,
      termsOfService, contact, license, openApiVersion,
      externalDocs, servers, tags, extensions, globalParameters,
      auth,
      path = 'docs',
      useGlobalPrefix, jsonDocumentUrl, yamlDocumentUrl,
      explorer, customCss, customCssUrl, customJs, customJsStr,
      customfavIcon, customSiteTitle, swaggerOptions,
    } = this.options;

    const builder = new DocumentBuilder()
      .setTitle(title)
      .setDescription(description)
      .setVersion(version);

    if (termsOfService) builder.setTermsOfService(termsOfService);
    if (contact) builder.setContact(contact.name, contact.url, contact.email);
    if (license) builder.setLicense(license.name, license.url);
    if (openApiVersion) builder.setOpenAPIVersion(openApiVersion);
    if (externalDocs) builder.setExternalDoc(externalDocs.description, externalDocs.url);
    if (servers) servers.forEach(({ url, description: desc, variables }) => builder.addServer(url, desc, variables));
    if (tags) tags.forEach(({ name, description: desc, externalDocs: ext }) => builder.addTag(name, desc, ext));
    if (extensions) extensions.forEach(({ key, value }) => builder.addExtension(key, value));
    if (globalParameters) builder.addGlobalParameters(...globalParameters);

    if (auth?.bearer) {
      const { options, name } = this.resolveAuthScheme(auth.bearer);
      builder.addBearerAuth(options, name ?? 'bearer');
    }
    if (auth?.basic) {
      const { options, name } = this.resolveAuthScheme(auth.basic);
      builder.addBasicAuth(options, name ?? 'basic');
    }
    if (auth?.apiKey) {
      builder.addApiKey(auth.apiKey.options, auth.apiKey.name ?? 'api-key');
    }
    if (auth?.oauth2) {
      builder.addOAuth2(auth.oauth2.options, auth.oauth2.name ?? 'oauth2');
    }
    if (auth?.cookie) {
      const { cookieName, options, name } = auth.cookie;
      builder.addCookieAuth(cookieName, options, name ?? 'cookie');
    }
    if (auth?.custom) {
      auth.custom.forEach(({ name, options, requirements }) => {
        builder.addSecurity(name, options);
        if (requirements) builder.addSecurityRequirements(name, requirements);
      });
    }

    const document = SwaggerModule.createDocument(app, builder.build());
    SwaggerModule.setup(path, app, document, {
      useGlobalPrefix,
      jsonDocumentUrl,
      yamlDocumentUrl,
      explorer,
      customCss,
      customCssUrl,
      customJs,
      customJsStr,
      customfavIcon,
      customSiteTitle,
      swaggerOptions: {
        docExpansion: 'none',
        defaultModelsExpandDepth: -1,
        persistAuthorization: true,
        displayRequestDuration: true,
        ...swaggerOptions,
      },
    });
  }

  private resolveAuthScheme(value: boolean | SwaggerAuthScheme): SwaggerAuthScheme {
    return typeof value === 'object' ? value : {};
  }
}
