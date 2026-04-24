import { TicketCategory } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class UpdateStaffStatusDto {
  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;

  @IsOptional()
  @ValidateIf((o: UpdateStaffStatusDto) => typeof o.currentLoad === 'string')
  @IsIn(['increment', 'decrement'])
  @ValidateIf((o: UpdateStaffStatusDto) => typeof o.currentLoad === 'number')
  @IsInt()
  @Min(0)
  currentLoad?: number | 'increment' | 'decrement';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  maxLoad?: number;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(TicketCategory, { each: true })
  categories?: TicketCategory[];
}
