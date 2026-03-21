import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, Kafka } from 'kafkajs';
import { KAFKA_CONSUMER_GROUP, KAFKA_TOPICS } from './kafka.topics';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private readonly consumer: Consumer;

  constructor(
    configService: ConfigService,
    private readonly queueService: QueueService,
  ) {
    const brokers  = configService.getOrThrow<string>('KAFKA_BROKERS').split(',');
    const clientId = configService.get<string>('KAFKA_CLIENT_ID') ?? 'queue-service';

    const kafka = new Kafka({ clientId, brokers });
    this.consumer = kafka.consumer({ groupId: KAFKA_CONSUMER_GROUP });
  }

  async onModuleInit(): Promise<void> {
    await this.consumer.connect();
    this.logger.log('Kafka consumer connected');

    await this.consumer.subscribe({
      topics: [KAFKA_TOPICS.TICKET_CREATED, KAFKA_TOPICS.TICKET_CLOSED],
      fromBeginning: false,
    });

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        const payload = JSON.parse(message.value?.toString() ?? '{}');

        this.logger.debug({ topic, payload }, 'Kafka message received');

        try {
          if (topic === KAFKA_TOPICS.TICKET_CREATED) {
            await this.queueService.handleTicketCreated(payload);
          } else if (topic === KAFKA_TOPICS.TICKET_CLOSED) {
            await this.queueService.handleTicketClosed(payload);
          }
        } catch (error) {
          this.logger.error({ topic, payload, error }, 'Failed to process Kafka message');
        }
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.consumer.disconnect();
    this.logger.log('Kafka consumer disconnected');
  }
}
