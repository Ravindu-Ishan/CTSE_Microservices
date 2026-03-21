import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaConsumerService } from '../kafka/kafka-consumer.service';
import { HttpClientsModule } from '../http-clients/http-clients.module';
import { PrismaModule } from '../prisma/prisma.module';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';

@Module({
  imports: [PrismaModule, HttpClientsModule, ConfigModule],
  controllers: [QueueController],
  providers: [QueueService, KafkaConsumerService],
})
export class QueueModule {}
