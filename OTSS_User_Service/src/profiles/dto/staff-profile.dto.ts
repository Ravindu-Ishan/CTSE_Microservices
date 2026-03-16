import { TicketCategory } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class StaffProfileInputDto {
  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  currentLoad?: number;

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
