import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

export function copyConfigFiles(
  files: string[],
  destDir: string,
  logger: Logger = new Logger('ConfigUtils'),
): string[] {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const copiedFiles: string[] = [];

  files.forEach((srcFile) => {
    const fileName = path.basename(srcFile);
    const destFile = path.join(destDir, fileName);

    fs.copyFileSync(srcFile, destFile);
    copiedFiles.push(destFile);
    logger.log(`Copied ${fileName} to ${destDir}`);
  });

  return copiedFiles;
}

export function loadConfigFiles(files: string[]): Record<string, any> {
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

export function getYamlFiles(
  directory: string,
  logger: Logger = new Logger('ConfigUtils'),
): string[] {
  if (!fs.existsSync(directory)) {
    logger.warn(`Config directory ${directory} does not exist.`);
    return [];
  }

  return fs
    .readdirSync(directory)
    .filter((file) => file.endsWith('.yml')) // `.yml` 확장자 필터링
    .map((file) => path.join(directory, file)); // 절대 경로로 변환
}
