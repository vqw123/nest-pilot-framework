import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository, Repository } from '@libs/database';
import { RedisService } from '@libs/redis';
import { RequestContext } from '@libs/common';
import { Redis } from 'ioredis';
import { ExampleEntity } from './entity/example.entity';
import { ExampleResponseDto } from './dto/example-response.dto';
import { CreateExampleDto } from './dto/create-example.dto';
import { UpdateExampleDto } from './dto/update-example.dto';
import { ExampleNotFoundException } from './exceptions/example.exceptions';

/** Redis 캐시 TTL (초) */
const CACHE_TTL_SECONDS = 60;

@Injectable()
export class ExampleService {
  private readonly logger = new Logger(ExampleService.name);
  private readonly redis: Redis;

  constructor(
    @InjectRepository(ExampleEntity)
    private readonly exampleRepository: Repository<ExampleEntity>,
    private readonly redisService: RedisService,
  ) {
    // RedisService에서 클라이언트를 직접 꺼내 저수준 명령어(setex, del 등)를 사용한다.
    this.redis = this.redisService.getOrThrow();
  }

  async create(dto: CreateExampleDto): Promise<ExampleResponseDto> {
    const example = this.exampleRepository.create(dto);
    const saved = await this.exampleRepository.save(example);
    return ExampleResponseDto.from(saved);
  }

  async findAll(): Promise<ExampleResponseDto[]> {
    const examples = await this.exampleRepository.find();
    return examples.map(ExampleResponseDto.from);
  }

  /**
   * 단건 조회 with Redis 캐시.
   * 캐시 미스 시 DB에서 조회 후 TTL을 설정해 저장한다.
   * 캐시 히트 시 요청 ID를 함께 로깅해 분산 추적을 지원한다.
   */
  async findOne(id: number): Promise<ExampleResponseDto> {
    const cacheKey = `example:${id}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.log(`Cache hit: ${cacheKey} [requestId: ${RequestContext.getRequestId()}]`);
      return JSON.parse(cached) as ExampleResponseDto;
    }

    const example = await this.exampleRepository.findOne({ where: { id } });
    if (!example) {
      throw new ExampleNotFoundException(id);
    }

    const response = ExampleResponseDto.from(example);
    await this.redis.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(response));
    return response;
  }

  async update(id: number, dto: UpdateExampleDto): Promise<ExampleResponseDto> {
    // findOne을 통해 존재 여부 확인 및 캐시 활용
    const example = await this.exampleRepository.findOne({ where: { id } });
    if (!example) {
      throw new ExampleNotFoundException(id);
    }

    Object.assign(example, dto);
    const updated = await this.exampleRepository.save(example);

    // 수정 후 캐시 무효화
    await this.redis.del(`example:${id}`);
    return ExampleResponseDto.from(updated);
  }

  async remove(id: number): Promise<void> {
    const example = await this.exampleRepository.findOne({ where: { id } });
    if (!example) {
      throw new ExampleNotFoundException(id);
    }

    await this.exampleRepository.remove(example);

    // 삭제 후 캐시 무효화
    await this.redis.del(`example:${id}`);
  }
}
