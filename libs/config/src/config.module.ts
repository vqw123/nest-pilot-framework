import { DynamicModule, Module, Logger, Provider } from '@nestjs/common';
import * as path from 'path';

import { ConfigService } from './services/config.service';
import { ConfigModuleOptions } from './interfaces/config.interface';
import { CONFIG } from './constants/config.constants';
import { copyConfigFiles, getYamlFiles, loadConfigFiles } from './utils/config.utils';

@Module({})
export class ConfigModule {
  private static readonly logger = new Logger(ConfigModule.name);

  static forRoot(options: ConfigModuleOptions, isGlobal: boolean = true): DynamicModule {
    const sourceDir =
      options.configPath ??
      path.resolve(
        process.cwd(),
        'apps',
        options.appName,
        'config',
        process.env.NODE_ENV || 'local',
      );
    const destDir = path.resolve(process.cwd(), 'dist', 'config');

    // `.yml` 파일 목록 가져오기
    const configFiles = getYamlFiles(sourceDir, this.logger);

    // `.yml` 파일을 `dist/env/`로 복사
    const copiedFiles = copyConfigFiles(configFiles, destDir, this.logger);

    // `.yml` 파일을 로드하여 객체로 변환
    const configData = loadConfigFiles(copiedFiles);

    const providers: Provider[] = [{ provide: CONFIG, useValue: configData }, ConfigService];

    return {
      global: isGlobal,
      module: ConfigModule,
      providers,
      exports: [CONFIG, ConfigService],
    };
  }
}
