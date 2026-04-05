import { PartialType } from '@nestjs/swagger';
import { CreatePromocodeDto } from './create-promocode.dto';

/** Subset of create fields for PATCH (partial update). */
export class UpdatePromocodeDto extends PartialType(CreatePromocodeDto) {}
