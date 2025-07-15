import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '../src/config.module';
import { ConfigService } from '../src/services/config.service';
import * as path from 'path';

describe('ConfigModule (Integration)', () => {
  let configService: ConfigService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          configPath: path.resolve(__dirname, '../__mocks__/config/local'),
        }),
      ],
    }).compile();

    configService = module.get(ConfigService);
  });

  it('should load values from YAML', () => {
    expect(configService.get('app.name')).toBe('test-app');
    expect(configService.get('app.version')).toBe('1.2.3');
  });

  it('should return undefined for missing key', () => {
    expect(configService.get('app.nonexistent')).toBeUndefined();
  });
});
