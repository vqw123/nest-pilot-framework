import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken } from '@libs/database';
import { RedisService } from '@libs/redis';
import { GlobalExceptionFilter, HttpExceptionFilter } from '@libs/error';
import { ExampleController } from '../src/example.controller';
import { ExampleService } from '../src/example.service';
import { ExampleEntity } from '../src/entity/example.entity';
import { ExampleResponseDto } from '../src/dto/example-response.dto';

const makeEntity = (overrides: Partial<ExampleEntity> = {}): ExampleEntity =>
  Object.assign(new ExampleEntity(), {
    id: 1,
    name: '예제',
    description: '설명',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-02T00:00:00Z'),
    ...overrides,
  });

describe('Example API (e2e)', () => {
  let app: INestApplication;
  let mockRepository: Record<string, jest.Mock>;
  let mockRedis: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    mockRedis = {
      get: jest.fn().mockResolvedValue(null),
      setex: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExampleController],
      providers: [
        ExampleService,
        {
          provide: getRepositoryToken(ExampleEntity),
          useValue: mockRepository,
        },
        {
          provide: RedisService,
          useValue: { getOrThrow: jest.fn().mockReturnValue(mockRedis) },
        },
      ],
    }).compile();

    app = module.createNestApplication();

    // 실제 앱과 동일한 파이프/필터를 적용해 HTTP 파이프라인을 검증한다.
    // GlobalExceptionFilter(catch-all) → HttpExceptionFilter(HttpException 전담) 순서로 등록한다.
    // useGlobalFilters는 마지막 등록 필터가 먼저 실행되므로 HttpExceptionFilter가 우선 적용된다.
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new GlobalExceptionFilter(), new HttpExceptionFilter());

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /examples', () => {
    it('201 - should create and return example', async () => {
      const entity = makeEntity();
      mockRepository.create.mockReturnValue(entity);
      mockRepository.save.mockResolvedValue(entity);

      const res = await request(app.getHttpServer())
        .post('/examples')
        .send({ name: '예제', description: '설명' })
        .expect(201);

      expect(res.body.id).toBe(1);
      expect(res.body.name).toBe('예제');
    });

    it('400 - should reject missing name', async () => {
      await request(app.getHttpServer())
        .post('/examples')
        .send({ description: '설명만 있음' })
        .expect(400);
    });

    it('400 - should reject unknown fields', async () => {
      await request(app.getHttpServer())
        .post('/examples')
        .send({ name: '예제', unknown: 'field' })
        .expect(400);
    });
  });

  describe('GET /examples', () => {
    it('200 - should return list of examples', async () => {
      const entities = [makeEntity(), makeEntity({ id: 2, name: '예제2' })];
      mockRepository.find.mockResolvedValue(entities);

      const res = await request(app.getHttpServer()).get('/examples').expect(200);

      expect(res.body).toHaveLength(2);
      expect(res.body[1].id).toBe(2);
    });

    it('200 - should return empty array when no data', async () => {
      mockRepository.find.mockResolvedValue([]);

      const res = await request(app.getHttpServer()).get('/examples').expect(200);

      expect(res.body).toEqual([]);
    });
  });

  describe('GET /examples/:id', () => {
    it('200 - should return example by id', async () => {
      const entity = makeEntity();
      mockRepository.findOne.mockResolvedValue(entity);

      const res = await request(app.getHttpServer()).get('/examples/1').expect(200);

      expect(res.body.id).toBe(1);
    });

    it('200 - should return cached data on cache hit', async () => {
      const cached: ExampleResponseDto = ExampleResponseDto.from(makeEntity());
      mockRedis.get.mockResolvedValue(JSON.stringify(cached));

      const res = await request(app.getHttpServer()).get('/examples/1').expect(200);

      expect(res.body.id).toBe(1);
      expect(mockRepository.findOne).not.toHaveBeenCalled();
    });

    it('404 - should return not found when example does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).get('/examples/999').expect(404);

      expect(res.body.code).toBe('EXAMPLE_NOT_FOUND');
    });

    it('400 - should reject non-numeric id', async () => {
      await request(app.getHttpServer()).get('/examples/abc').expect(400);
    });
  });

  describe('PATCH /examples/:id', () => {
    it('200 - should update and return example', async () => {
      const updated = makeEntity({ name: '수정됨' });
      mockRepository.findOne.mockResolvedValue(makeEntity());
      mockRepository.save.mockResolvedValue(updated);

      const res = await request(app.getHttpServer())
        .patch('/examples/1')
        .send({ name: '수정됨' })
        .expect(200);

      expect(res.body.name).toBe('수정됨');
    });

    it('404 - should return not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .patch('/examples/999')
        .send({ name: '수정됨' })
        .expect(404);

      expect(res.body.code).toBe('EXAMPLE_NOT_FOUND');
    });
  });

  describe('DELETE /examples/:id', () => {
    it('204 - should delete example', async () => {
      const entity = makeEntity();
      mockRepository.findOne.mockResolvedValue(entity);
      mockRepository.remove.mockResolvedValue(entity);

      await request(app.getHttpServer()).delete('/examples/1').expect(204);

      expect(mockRepository.remove).toHaveBeenCalledWith(entity);
      expect(mockRedis.del).toHaveBeenCalledWith('example:1');
    });

    it('404 - should return not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).delete('/examples/999').expect(404);

      expect(res.body.code).toBe('EXAMPLE_NOT_FOUND');
    });
  });
});
