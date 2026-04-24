import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from '../email/email.module';
import { HttpClientsModule } from '../http-clients/http-clients.module';
import { KafkaConsumerService } from '../kafka/kafka-consumer.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [PrismaModule, EmailModule, ConfigModule, HttpClientsModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, KafkaConsumerService],
})
export class NotificationsModule {}
