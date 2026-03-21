import { ApiPropertyOptional } from '@nestjs/swagger';
import { QueueEntryStatus, TicketCategory, TicketPriority } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class QueueFilterDto {
  @ApiPropertyOptional({ enum: QueueEntryStatus })
  @IsEnum(QueueEntryStatus)
  @IsOptional()
  status?: QueueEntryStatus;

  @ApiPropertyOptional({ enum: TicketPriority })
  @IsEnum(TicketPriority)
  @IsOptional()
  ticketPriority?: TicketPriority;

  @ApiPropertyOptional({ enum: TicketCategory })
  @IsEnum(TicketCategory)
  @IsOptional()
  ticketCategory?: TicketCategory;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  assignedStaffId?: string;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ default: 0, minimum: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number;
}
