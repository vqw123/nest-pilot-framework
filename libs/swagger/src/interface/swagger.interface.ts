import {
  InjectionToken,
  ModuleMetadata,
  OptionalFactoryDependency,
  Provider,
} from '@nestjs/common';
import {
  SecuritySchemeObject,
  ParameterObject,
  ServerVariableObject,
  ExternalDocumentationObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { SwaggerUiOptions } from '@nestjs/swagger/dist/interfaces/swagger-ui-options.interface';

export interface SwaggerAuthScheme {
  options?: SecuritySchemeObject;
  name?: string;
}

export interface SwaggerCookieAuthScheme {
  cookieName?: string;
  options?: SecuritySchemeObject;
  name?: string;
}

export interface SwaggerCustomAuthScheme {
  name: string;
  options: SecuritySchemeObject;
  requirements?: string[];
}

export interface SwaggerAuthOptions {
  bearer?: boolean | SwaggerAuthScheme;
  basic?: boolean | SwaggerAuthScheme;
  apiKey?: SwaggerAuthScheme;
  oauth2?: SwaggerAuthScheme;
  cookie?: SwaggerCookieAuthScheme;
  custom?: SwaggerCustomAuthScheme[];
}

export interface SwaggerModuleOptions {
  // DocumentBuilder
  title: string;
  description: string;
  version: string;
  termsOfService?: string;
  contact?: { name: string; url: string; email: string };
  license?: { name: string; url: string };
  openApiVersion?: string;
  externalDocs?: { description: string; url: string };
  servers?: { url: string; description?: string; variables?: Record<string, ServerVariableObject> }[];
  tags?: { name: string; description?: string; externalDocs?: ExternalDocumentationObject }[];
  extensions?: { key: string; value: any }[];
  globalParameters?: Omit<ParameterObject, 'example' | 'examples'>[];
  auth?: SwaggerAuthOptions;

  // SwaggerModule.setup
  path?: string;
  useGlobalPrefix?: boolean;
  jsonDocumentUrl?: string;
  yamlDocumentUrl?: string;
  explorer?: boolean;
  customCss?: string;
  customCssUrl?: string | string[];
  customJs?: string | string[];
  customJsStr?: string | string[];
  customfavIcon?: string;
  customSiteTitle?: string;
  swaggerOptions?: SwaggerUiOptions;
}

export interface SwaggerModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => SwaggerModuleOptions | Promise<SwaggerModuleOptions>;
  inject?: InjectionToken[] | OptionalFactoryDependency[];
  extraProviders?: Provider[];
}
