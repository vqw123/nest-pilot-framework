import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ExampleService } from './example.service';
import { ExampleResponseDto } from './dto/example-response.dto';
import { CreateExampleDto } from './dto/create-example.dto';
import { UpdateExampleDto } from './dto/update-example.dto';

/**
 * Example CRUD 컨트롤러.
 * 라이브러리 사용 패턴을 보여주는 예제로,
 * DB 조회(TypeORM), 캐싱(Redis), 에러 처리(BaseHttpException), Swagger 문서화를 포함한다.
 */
@ApiTags('examples')
@ApiBearerAuth()
@Controller('examples')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Post()
  @ApiOperation({ summary: '생성' })
  @ApiCreatedResponse({ type: ExampleResponseDto })
  async create(@Body() dto: CreateExampleDto): Promise<ExampleResponseDto> {
    return this.exampleService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '목록 조회' })
  @ApiOkResponse({ type: [ExampleResponseDto] })
  async findAll(): Promise<ExampleResponseDto[]> {
    return this.exampleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '단건 조회 (Redis 캐시)' })
  @ApiOkResponse({ type: ExampleResponseDto })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ExampleResponseDto> {
    return this.exampleService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '수정' })
  @ApiOkResponse({ type: ExampleResponseDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExampleDto,
  ): Promise<ExampleResponseDto> {
    return this.exampleService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '삭제' })
  @ApiNoContentResponse()
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.exampleService.remove(id);
  }
}
