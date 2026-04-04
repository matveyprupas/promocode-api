import { Injectable } from '@nestjs/common';
import { ActivatePromocodeDto } from './dto/activate-promocode.dto';
import { CreatePromocodeDto } from './dto/create-promocode.dto';

@Injectable()
export class PromocodesService {
  async create(_dto: CreatePromocodeDto): Promise<void> {
    // Persistence and business rules will be implemented with Prisma.
  }

  async activate(_code: string, _dto: ActivatePromocodeDto): Promise<void> {
    // Activation flow will be implemented with Prisma.
  }
}
