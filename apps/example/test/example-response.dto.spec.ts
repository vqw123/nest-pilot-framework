import { ExampleResponseDto } from '../src/dto/example-response.dto';
import { ExampleEntity } from '../src/entity/example.entity';

const makeEntity = (overrides: Partial<ExampleEntity> = {}): ExampleEntity =>
  Object.assign(new ExampleEntity(), {
    id: 1,
    name: '예제',
    description: '설명',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    ...overrides,
  });

describe('ExampleResponseDto', () => {
  describe('from', () => {
    it('should map all fields from entity', () => {
      const entity = makeEntity();
      const dto = ExampleResponseDto.from(entity);

      expect(dto.id).toBe(entity.id);
      expect(dto.name).toBe(entity.name);
      expect(dto.description).toBe(entity.description);
      expect(dto.createdAt).toBe(entity.createdAt);
      expect(dto.updatedAt).toBe(entity.updatedAt);
    });

    it('should handle null description', () => {
      const entity = makeEntity({ description: null });
      const dto = ExampleResponseDto.from(entity);

      expect(dto.description).toBeNull();
    });

    it('should return a new ExampleResponseDto instance', () => {
      const entity = makeEntity();
      const dto = ExampleResponseDto.from(entity);

      expect(dto).toBeInstanceOf(ExampleResponseDto);
    });
  });
});
