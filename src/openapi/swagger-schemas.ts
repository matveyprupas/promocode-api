import { ApiProperty } from '@nestjs/swagger';

/** Promocode resource returned by the API. */
export class PromocodeEntity {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'SUMMER2026' })
  code: string;

  @ApiProperty({ minimum: 1, maximum: 100, example: 15 })
  discount: number;

  @ApiProperty({ minimum: 1, example: 100 })
  limit: number;

  @ApiProperty({ minimum: 0, example: 0 })
  activationCount: number;

  @ApiProperty({ type: String, format: 'date-time' })
  expiresAt: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: string;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: string;
}

export class ApiErrorDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiProperty({ example: 'Promocode activation limit reached' })
  message: string;
}

export class ActivatePromocodeResponseDto {
  @ApiProperty({ example: 'Promocode activated successfully' })
  message: string;

  @ApiProperty({ minimum: 1, maximum: 100, example: 15 })
  discount: number;
}

export class PromocodeListResponseDto {
  @ApiProperty({ type: [PromocodeEntity] })
  items: PromocodeEntity[];

  @ApiProperty({ minimum: 1, example: 1 })
  page: number;

  @ApiProperty({ minimum: 1, maximum: 100, example: 10 })
  limit: number;

  @ApiProperty({ minimum: 0, example: 42 })
  total: number;
}
