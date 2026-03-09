import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ModuleMetadata } from '@nestjs/common';

export interface DatabaseModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => TypeOrmModuleOptions | Promise<TypeOrmModuleOptions>;
  inject?: any[];
}
