import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaConsumerService } from './kafka-consumer.service';

// KafkaModule is imported by QueueModule — QueueService is injected into the consumer
// The forwardRef is handled by importing QueueModule here
@Module({
  imports: [ConfigModule],
  providers: [KafkaConsumerService],
  exports: [KafkaConsumerService],
})
export class KafkaModule {}
