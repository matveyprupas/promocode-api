import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import {
  ActivatePromocodeResponseDto,
  ApiErrorDto,
  PromocodeEntity,
  PromocodeListResponseDto,
} from '../openapi/swagger-schemas';
import { ActivatePromocodeDto } from './dto/activate-promocode.dto';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { ListPromocodesQueryDto } from './dto/list-promocodes-query.dto';
import { UpdatePromocodeDto } from './dto/update-promocode.dto';
import { PromocodesService } from './promocodes.service';

@ApiTags('promocodes')
@ApiExtraModels(
  PromocodeEntity,
  ApiErrorDto,
  ActivatePromocodeResponseDto,
  PromocodeListResponseDto,
  UpdatePromocodeDto,
)
@Controller('promocodes')
export class PromocodesController {
  constructor(private readonly promocodesService: PromocodesService) {}

  @Post()
  @ApiOperation({ summary: 'Create promocode' })
  @ApiBody({ type: CreatePromocodeDto })
  @ApiCreatedResponse({
    description: 'Promocode created',
    type: PromocodeEntity,
  })
  @ApiConflictResponse({
    description: 'A promocode with this code already exists',
    type: ApiErrorDto,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Validation error',
    type: ApiErrorDto,
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreatePromocodeDto): Promise<PromocodeEntity> {
    return this.promocodesService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List promocodes',
    description:
      'Returns a paginated list. `limit` must be at most 100 (otherwise 422).',
  })
  @ApiOkResponse({ type: PromocodeListResponseDto })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid pagination parameters',
    type: ApiErrorDto,
  })
  findAll(
    @Query() query: ListPromocodesQueryDto,
  ): Promise<PromocodeListResponseDto> {
    return this.promocodesService.findAll(query);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Activate promocode',
    description:
      'Binds the promocode to an email and decrements remaining activations.',
  })
  @ApiParam({
    name: 'id',
    description: 'Promocode ID',
    format: 'uuid',
  })
  @ApiBody({ type: ActivatePromocodeDto })
  @ApiOkResponse({
    description: 'Activation successful',
    type: ActivatePromocodeResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Promocode not found',
    type: ApiErrorDto,
  })
  @ApiBadRequestResponse({
    description: 'Promocode expired or activation limit reached',
    type: ApiErrorDto,
  })
  @ApiConflictResponse({
    description: 'This email has already activated this promocode',
    type: ApiErrorDto,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid email',
    type: ApiErrorDto,
  })
  activate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActivatePromocodeDto,
  ): Promise<ActivatePromocodeResponseDto> {
    return this.promocodesService.activate(id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get promocode by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: PromocodeEntity })
  @ApiNotFoundResponse({
    description: 'Promocode not found',
    type: ApiErrorDto,
  })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PromocodeEntity> {
    return this.promocodesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partial update promocode' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdatePromocodeDto })
  @ApiOkResponse({ type: PromocodeEntity })
  @ApiNotFoundResponse({
    description: 'Promocode not found',
    type: ApiErrorDto,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Validation error',
    type: ApiErrorDto,
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePromocodeDto,
  ): Promise<PromocodeEntity> {
    return this.promocodesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete promocode' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Deleted' })
  @ApiNotFoundResponse({
    description: 'Promocode not found',
    type: ApiErrorDto,
  })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.promocodesService.remove(id);
  }
}
