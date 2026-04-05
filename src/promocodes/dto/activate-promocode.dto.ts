import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ActivatePromocodeDto {
  @ApiProperty({ format: 'email', example: 'user@example.com' })
  @IsEmail()
  email: string;
}
