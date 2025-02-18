import * as fs from 'fs';
import * as path from 'path';

export const getYamlFiles = (directory: string): string[] => {
  if (!fs.existsSync(directory)) {
    console.warn(`⚠️ Config directory ${directory} does not exist.`);
    return [];
  }

  return fs
    .readdirSync(directory)
    .filter((file) => file.endsWith('.yml')) // ✅ `.yml` 확장자 필터링
    .map((file) => path.join(directory, file)); // ✅ 절대 경로로 변환
};
