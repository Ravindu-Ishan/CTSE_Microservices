import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { EventClaimDto } from './event-claim.dto';

export class EventUserDto {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventClaimDto)
  claims?: EventClaimDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventClaimDto)
  addedClaims?: EventClaimDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EventClaimDto)
  updatedClaims?: EventClaimDto[];
}
