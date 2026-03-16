import { IsString } from 'class-validator';

export class EventClaimDto {
  @IsString()
  uri: string;

  @IsString()
  value: string;
}
