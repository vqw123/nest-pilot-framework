import { DynamicModule, Global, Module, Logger } from '@nestjs/common';
import { ConfigService } from './service/config.service';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

@Global()
@Module({})
export class ConfigModule {
  private static readonly logger = new Logger(ConfigModule.name);

  static forRoot(appName: string): DynamicModule {
    const env = process.env.NODE_ENV || 'local';
    const sourceDir = path.join(__dirname, `../../../../apps/${appName}/config/${env}`);
    const destDir = path.join(__dirname, `../../../../dist/config`);

    // `.yml` 파일 목록 가져오기
    const configFiles = ConfigModule.getYamlFiles(sourceDir);

    // `.yml` 파일을 `dist/env/`로 복사
    const copiedFiles = ConfigModule.copyConfigFiles(configFiles, destDir);

    // `.yml` 파일을 로드하여 객체로 변환
    const configData = ConfigModule.loadConfigFiles(copiedFiles);

    return {
      module: ConfigModule,
      providers: [
        {
          provide: 'CONFIG',
          useValue: configData, // 모든 로드된 설정 데이터를 제공
        },
        ConfigService,
      ],
      exports: ['CONFIG', ConfigService], // ConfigService를 전역으로 사용 가능하도록 설정
    };
  }

  private static copyConfigFiles(files: string[], destDir: string): string[] {
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const copiedFiles: string[] = [];

    files.forEach((srcFile) => {
      const fileName = path.basename(srcFile);
      const destFile = path.join(destDir, fileName);

      fs.copyFileSync(srcFile, destFile);
      copiedFiles.push(destFile);
      ConfigModule.logger.log(`Copied ${fileName} to ${destDir}`);
    });

    return copiedFiles;
  }

  private static loadConfigFiles(files: string[]): Record<string, any> {
    let configData: Record<string, any> = {};

    files.forEach((file) => {
      if (fs.existsSync(file)) {
        const fileContent = fs.readFileSync(file, 'utf8');
        const parsedData = yaml.load(fileContent) as Record<string, any>;
        configData = { ...configData, ...parsedData };
      }
    });

    return configData;
  }

  private static getYamlFiles(directory: string): string[] {
    if (!fs.existsSync(directory)) {
      ConfigModule.logger.warn(`Config directory ${directory} does not exist.`);
      return [];
    }

    return fs
      .readdirSync(directory)
      .filter((file) => file.endsWith('.yml')) // `.yml` 확장자 필터링
      .map((file) => path.join(directory, file)); // 절대 경로로 변환
  }
}
