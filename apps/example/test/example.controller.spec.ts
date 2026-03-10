import { ExampleController } from '../src/example.controller';
import { ExampleService } from '../src/example.service';
import { ExampleResponseDto } from '../src/dto/example-response.dto';
import { CreateExampleDto } from '../src/dto/create-example.dto';
import { UpdateExampleDto } from '../src/dto/update-example.dto';

const makeDto = (overrides: Partial<ExampleResponseDto> = {}): ExampleResponseDto =>
  Object.assign(new ExampleResponseDto(), {
    id: 1,
    name: '예제',
    description: '설명',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

describe('ExampleController', () => {
  let controller: ExampleController;
  let service: jest.Mocked<ExampleService>;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<ExampleService>;

    controller = new ExampleController(service);
  });

  describe('create', () => {
    it('should delegate to service and return result', async () => {
      const dto: CreateExampleDto = { name: '예제', description: '설명' };
      const result = makeDto();
      service.create.mockResolvedValue(result);

      await expect(controller.create(dto)).resolves.toBe(result);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return array from service', async () => {
      const result = [makeDto(), makeDto({ id: 2 })];
      service.findAll.mockResolvedValue(result);

      await expect(controller.findAll()).resolves.toBe(result);
    });
  });

  describe('findOne', () => {
    it('should pass id to service', async () => {
      const result = makeDto();
      service.findOne.mockResolvedValue(result);

      await expect(controller.findOne(1)).resolves.toBe(result);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should pass id and dto to service', async () => {
      const dto: UpdateExampleDto = { name: '수정됨' };
      const result = makeDto({ name: '수정됨' });
      service.update.mockResolvedValue(result);

      await expect(controller.update(1, dto)).resolves.toBe(result);
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should pass id to service', async () => {
      service.remove.mockResolvedValue(undefined);

      await expect(controller.remove(1)).resolves.toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
