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

export interface SwaggerMoudleOptions {
  title: string;
  description: string;
  version: string;
  termsOfService?: string;
  contact?: {
    name: string;
    url: string;
    email: string;
  };
  license?: {
    name: string;
    url: string;
  };
  openApiVersion?: string;
  servers?: {
    url: string;
    description?: string;
    variables?: Record<string, ServerVariableObject>;
  }[];
  externalDocs?: { description: string; url: string };
  basePath?: string;
  tags?: { name: string; description?: string; externalDocs?: ExternalDocumentationObject }[];
  extensions?: { key: string; value: any }[];
  security?: { name: string; options: SecuritySchemeObject; requirements?: string[] }[];
  globalParameters?: Omit<ParameterObject, 'example' | 'examples'>[];
}

export interface SwaggerModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (...args: unknown[]) => SwaggerMoudleOptions | Promise<SwaggerMoudleOptions>;
  inject?: InjectionToken[] | OptionalFactoryDependency[];
  extraProviders?: Provider[];
}
