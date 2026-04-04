import { Body, Controller, Param, Post } from '@nestjs/common';
import { ActivatePromocodeDto } from './dto/activate-promocode.dto';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { PromocodesService } from './promocodes.service';

@Controller('promocodes')
export class PromocodesController {
  constructor(private readonly promocodesService: PromocodesService) {}

  @Post()
  create(@Body() dto: CreatePromocodeDto): Promise<void> {
    return this.promocodesService.create(dto);
  }

  @Post(':code/activate')
  activate(
    @Param('code') code: string,
    @Body() dto: ActivatePromocodeDto,
  ): Promise<void> {
    return this.promocodesService.activate(code, dto);
  }
}
