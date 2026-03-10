import { ExampleService } from '../src/example.service';
import { ExampleEntity } from '../src/entity/example.entity';
import { ExampleResponseDto } from '../src/dto/example-response.dto';
import { ExampleNotFoundException } from '../src/exceptions/example.exceptions';
import { Repository } from '@libs/database';
import { RedisService } from '@libs/redis';
import { Redis } from 'ioredis';

const makeEntity = (overrides: Partial<ExampleEntity> = {}): ExampleEntity =>
  Object.assign(new ExampleEntity(), {
    id: 1,
    name: '예제',
    description: '설명',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    ...overrides,
  });

describe('ExampleService', () => {
  let service: ExampleService;
  let repository: jest.Mocked<Repository<ExampleEntity>>;
  let redis: jest.Mocked<Pick<Redis, 'get' | 'setex' | 'del'>>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<Repository<ExampleEntity>>;

    redis = {
      get: jest.fn(),
      setex: jest.fn(),
      del: jest.fn(),
    };

    const redisService = {
      getOrThrow: jest.fn().mockReturnValue(redis),
    } as unknown as RedisService;

    service = new ExampleService(repository, redisService);
  });

  describe('create', () => {
    it('should create and return response dto', async () => {
      const dto = { name: '예제', description: '설명' };
      const entity = makeEntity();
      repository.create.mockReturnValue(entity);
      repository.save.mockResolvedValue(entity);

      const result = await service.create(dto);

      expect(result).toBeInstanceOf(ExampleResponseDto);
      expect(result.name).toBe(entity.name);
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(entity);
    });
  });

  describe('findAll', () => {
    it('should return array of response dtos', async () => {
      const entities = [makeEntity(), makeEntity({ id: 2, name: '예제2' })];
      repository.find.mockResolvedValue(entities);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(ExampleResponseDto);
      expect(result[1].id).toBe(2);
    });

    it('should return empty array when no entities', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return cached data on cache hit', async () => {
      const entity = makeEntity();
      const cached = ExampleResponseDto.from(entity);
      redis.get.mockResolvedValue(JSON.stringify(cached));

      const result = await service.findOne(1);

      // JSON.parse는 Date를 string으로 복원하므로 직렬화된 형태로 비교한다.
      expect(result).toEqual(JSON.parse(JSON.stringify(cached)));
      expect(repository.findOne).not.toHaveBeenCalled();
      expect(redis.get).toHaveBeenCalledWith('example:1');
    });

    it('should fetch from db and cache on cache miss', async () => {
      const entity = makeEntity();
      redis.get.mockResolvedValue(null);
      repository.findOne.mockResolvedValue(entity);
      redis.setex.mockResolvedValue('OK');

      const result = await service.findOne(1);

      expect(result).toBeInstanceOf(ExampleResponseDto);
      expect(result.id).toBe(1);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(redis.setex).toHaveBeenCalledWith(
        'example:1',
        60,
        expect.any(String),
      );
    });

    it('should throw ExampleNotFoundException when entity not found', async () => {
      redis.get.mockResolvedValue(null);
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(ExampleNotFoundException);
    });
  });

  describe('update', () => {
    it('should update entity and invalidate cache', async () => {
      const entity = makeEntity();
      const updatedEntity = makeEntity({ name: '수정됨' });
      repository.findOne.mockResolvedValue(entity);
      repository.save.mockResolvedValue(updatedEntity);
      redis.del.mockResolvedValue(1);

      const result = await service.update(1, { name: '수정됨' });

      expect(result.name).toBe('수정됨');
      expect(redis.del).toHaveBeenCalledWith('example:1');
    });

    it('should throw ExampleNotFoundException when entity not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update(99, { name: '수정됨' })).rejects.toThrow(
        ExampleNotFoundException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove entity and invalidate cache', async () => {
      const entity = makeEntity();
      repository.findOne.mockResolvedValue(entity);
      repository.remove.mockResolvedValue(entity);
      redis.del.mockResolvedValue(1);

      await service.remove(1);

      expect(repository.remove).toHaveBeenCalledWith(entity);
      expect(redis.del).toHaveBeenCalledWith('example:1');
    });

    it('should throw ExampleNotFoundException when entity not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(ExampleNotFoundException);
      expect(repository.remove).not.toHaveBeenCalled();
    });
  });
});
