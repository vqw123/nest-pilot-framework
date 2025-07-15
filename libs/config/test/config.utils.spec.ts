import * as path from 'path';
import * as fs from 'fs';
import { copyConfigFiles, getYamlFiles, loadConfigFiles } from '../src/utils/config.utils';

describe('Config Utils', () => {
  const mockDir = path.resolve(__dirname, '../__mocks__/config/local');
  const outputDir = path.resolve(__dirname, '../__temp__/config');

  beforeEach(() => {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true });
    }
  });

  describe('getYamlFiles()', () => {
    it('should return only .yml files from directory', () => {
      const files = getYamlFiles(mockDir);
      expect(files.length).toBeGreaterThan(0);
      expect(files.every((f) => f.endsWith('.yml'))).toBe(true);
    });

    it('should return empty array if directory does not exist', () => {
      const files = getYamlFiles('/invalid/path');
      expect(files).toEqual([]);
    });
  });

  describe('copyConfigFiles()', () => {
    it('should copy YAML files to target directory', () => {
      const files = getYamlFiles(mockDir);
      const copied = copyConfigFiles(files, outputDir);
      copied.forEach((f) => {
        expect(fs.existsSync(f)).toBe(true);
      });
    });
  });

  describe('loadConfigFiles()', () => {
    it('should load parsed YAML content as object', () => {
      const files = getYamlFiles(mockDir);
      const copied = copyConfigFiles(files, outputDir);
      const config = loadConfigFiles(copied);
      expect(config).toHaveProperty('app.name', 'test-app');
      expect(config).toHaveProperty('app.version', '1.2.3');
    });

    it('should return empty object if no file exists', () => {
      const config = loadConfigFiles(['/invalid/file.yml']);
      expect(config).toEqual({});
    });
  });
});
