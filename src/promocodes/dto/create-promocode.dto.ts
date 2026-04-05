import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsString, Max, Min } from 'class-validator';

export class CreatePromocodeDto {
  @ApiProperty({ example: 'SUMMER2026' })
  @IsString()
  code: string;

  @ApiProperty({ minimum: 1, maximum: 100, example: 15 })
  @IsInt()
  @Min(1)
  @Max(100)
  discount: number;

  @ApiProperty({ minimum: 1, example: 100 })
  @IsInt()
  @Min(1)
  limit: number;

  @ApiProperty({
    example: '2026-12-31T23:59:59.000Z',
    description: 'Expiry datetime (ISO 8601).',
  })
  @IsDateString()
  expiresAt: string;
}
