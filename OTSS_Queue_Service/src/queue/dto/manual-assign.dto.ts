import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ManualAssignDto {
  @ApiProperty({ description: 'Staff member ID to assign the ticket to' })
  @IsUUID()
  @IsNotEmpty()
  staffId: string;
}
