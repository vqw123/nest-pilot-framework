import { Test, TestingModule } from '@nestjs/testing';
import { ErrorModule } from '../src/error.module';

describe('ErrorModule', () => {
  let module: TestingModule;

  afterEach(async () => {
    await module?.close();
  });

  it('should compile with no options', async () => {
    module = await Test.createTestingModule({
      imports: [ErrorModule.forRoot()],
    }).compile();

    expect(module).toBeDefined();
  });

  it('should compile with customFilters', async () => {
    module = await Test.createTestingModule({
      imports: [
        ErrorModule.forRoot({
          customFilters: [],
        }),
      ],
    }).compile();

    expect(module).toBeDefined();
  });
});
