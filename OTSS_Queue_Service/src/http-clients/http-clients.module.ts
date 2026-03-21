import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { UserServiceClient } from './user-service.client';
import { TicketServiceClient } from './ticket-service.client';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [UserServiceClient, TicketServiceClient],
  exports: [UserServiceClient, TicketServiceClient],
})
export class HttpClientsModule {}
