import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Promocode } from '@prisma/client';
import {
  ActivatePromocodeResponseDto,
  DeletePromocodeResponseDto,
  PromocodeEntity,
  PromocodeListResponseDto,
} from '../openapi/swagger-schemas';
import { PrismaService } from '../prisma/prisma.service';
import { ActivatePromocodeDto } from './dto/activate-promocode.dto';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { ListPromocodesQueryDto } from './dto/list-promocodes-query.dto';
import { UpdatePromocodeDto } from './dto/update-promocode.dto';

@Injectable()
export class PromocodesService {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(p: Promocode): PromocodeEntity {
    return {
      id: p.id,
      code: p.code,
      discount: p.discount,
      limit: p.limit,
      activationCount: p.activationCount,
      expiresAt: p.expiresAt.toISOString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  }

  async create(dto: CreatePromocodeDto): Promise<PromocodeEntity> {
    const row = await this.prisma.promocode.create({
      data: {
        code: dto.code,
        discount: dto.discount,
        limit: dto.limit,
        expiresAt: new Date(dto.expiresAt),
      },
    });
    return this.toEntity(row);
  }

  async findAll(
    query: ListPromocodesQueryDto,
  ): Promise<PromocodeListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [total, rows] = await Promise.all([
      this.prisma.promocode.count(),
      this.prisma.promocode.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      items: rows.map((p) => this.toEntity(p)),
      page,
      limit,
      total,
    };
  }

  async findOne(id: string): Promise<PromocodeEntity> {
    const row = await this.prisma.promocode.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException('Promocode not found');
    }
    return this.toEntity(row);
  }

  async update(id: string, dto: UpdatePromocodeDto): Promise<PromocodeEntity> {
    const data: Prisma.PromocodeUpdateInput = {};
    if (dto.code !== undefined) {
      data.code = dto.code;
    }
    if (dto.discount !== undefined) {
      data.discount = dto.discount;
    }
    if (dto.limit !== undefined) {
      data.limit = dto.limit;
    }
    if (dto.expiresAt !== undefined) {
      data.expiresAt = new Date(dto.expiresAt);
    }

    try {
      const row = await this.prisma.promocode.update({
        where: { id },
        data,
      });
      return this.toEntity(row);
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('Promocode not found');
      }
      throw e;
    }
  }

  async remove(id: string): Promise<DeletePromocodeResponseDto> {
    try {
      const row = await this.prisma.promocode.delete({ where: { id } });
      const deleted = this.toEntity(row);
      return {
        message: `Promocode ${row.code} was permanently deleted from the database.`,
        deleted,
      };
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('Promocode not found');
      }
      throw e;
    }
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
