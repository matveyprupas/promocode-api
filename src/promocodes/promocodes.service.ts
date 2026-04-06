import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async activate(
    id: string,
    dto: ActivatePromocodeDto,
  ): Promise<ActivatePromocodeResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const promos = await tx.$queryRaw<Promocode[]>`
        SELECT *
        FROM "promocodes"
        WHERE id = ${id}::uuid
        FOR UPDATE
      `;
      const promo = promos[0];

      if (!promo) {
        throw new NotFoundException('Promocode not found');
      }

      if (promo.expiresAt < new Date()) {
        throw new BadRequestException('Promocode expired');
      }

      if (promo.activationCount >= promo.limit) {
        throw new BadRequestException('Activation limit reached');
      }

      const existingActivation = await tx.activation.findUnique({
        where: {
          promocodeId_email: { promocodeId: id, email: dto.email },
        },
      });
      if (existingActivation) {
        throw new ConflictException(
          'This email has already activated this promocode',
        );
      }

      await tx.activation.create({
        data: { promocodeId: id, email: dto.email },
      });

      await tx.promocode.update({
        where: { id },
        data: { activationCount: { increment: 1 } },
      });

      return {
        message: 'Promocode activated successfully',
        discount: promo.discount,
      };
    });
  }
}
