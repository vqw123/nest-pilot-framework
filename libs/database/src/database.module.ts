import { ConfigService } from '@libs/config';
import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EntitySchema, MixedList } from 'typeorm';

@Module({})
export class DatabaseModule {
  static forRoot(
    dbKey: string = 'default',
    entities: MixedList<Function | string | EntitySchema> = ['dist/**/*.entity.{ts,js}'],
  ): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            const dbConfig = configService.get(`database.${dbKey}`) as TypeOrmModuleOptions;

            if (!dbConfig) {
              throw new Error(`Database configuration for '${dbKey}' not found`);
            }

            return { ...dbConfig, entities } as TypeOrmModuleOptions;
          },
        }),
      ],
      exports: [TypeOrmModule],
    };
  }
}
