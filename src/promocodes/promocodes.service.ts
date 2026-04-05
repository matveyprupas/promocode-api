import { Injectable } from '@nestjs/common';
import {
  ActivatePromocodeResponseDto,
  PromocodeEntity,
  PromocodeListResponseDto,
} from '../openapi/swagger-schemas';
import { ActivatePromocodeDto } from './dto/activate-promocode.dto';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { ListPromocodesQueryDto } from './dto/list-promocodes-query.dto';
import { UpdatePromocodeDto } from './dto/update-promocode.dto';

@Injectable()
export class PromocodesService {
  create(dto: CreatePromocodeDto): Promise<PromocodeEntity> {
    const now = new Date().toISOString();
    return Promise.resolve({
      id: '00000000-0000-4000-8000-000000000000',
      code: dto.code,
      discount: dto.discount,
      limit: dto.limit,
      activationCount: 0,
      expiresAt: dto.expiresAt,
      createdAt: now,
      updatedAt: now,
    });
  }

  findAll(query: ListPromocodesQueryDto): Promise<PromocodeListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    return Promise.resolve({
      items: [],
      page,
      limit,
      total: 0,
    });
  }

  findOne(id: string): Promise<PromocodeEntity> {
    void id;
    return Promise.resolve({
      id: '00000000-0000-4000-8000-000000000000',
      code: 'STUB',
      discount: 1,
      limit: 1,
      activationCount: 0,
      expiresAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  update(id: string, dto: UpdatePromocodeDto): Promise<PromocodeEntity> {
    void dto;
    return this.findOne(id);
  }

  remove(id: string): Promise<void> {
    void id;
    return Promise.resolve();
  }

  activate(
    id: string,
    dto: ActivatePromocodeDto,
  ): Promise<ActivatePromocodeResponseDto> {
    void id;
    void dto;
    return Promise.resolve({
      message: 'Promocode activated successfully',
      discount: 0,
    });
  }
}
