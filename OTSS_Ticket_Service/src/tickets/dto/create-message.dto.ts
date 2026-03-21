import { ApiProperty } from '@nestjs/swagger';
import { MessageAuthorRole } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ example: 'I have tried restarting but the issue persists.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;

  @ApiProperty({ example: 'uuid-of-the-author' })
  @IsUUID()
  authorId: string;

  @ApiProperty({ enum: MessageAuthorRole, example: MessageAuthorRole.END_USER })
  @IsEnum(MessageAuthorRole)
  authorRole: MessageAuthorRole;
}
