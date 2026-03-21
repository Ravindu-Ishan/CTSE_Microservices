import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, TicketStatus } from '@prisma/client';
import { CreateMessageDto } from './dto/create-message.dto';
import { PrismaService } from '../prisma/prisma.service';
import { KafkaProducerService } from '../kafka/kafka-producer.service';
import { KAFKA_TOPICS } from '../kafka/kafka.topics';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketFilterDto } from './dto/ticket-filter.dto';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly kafka: KafkaProducerService,
  ) {}

  async create(dto: CreateTicketDto) {
    const ticket = await this.prisma.ticket.create({
      data: {
        title:       dto.title,
        description: dto.description,
        category:    dto.category,
        priority:    dto.priority,
        createdBy:   dto.createdBy,
      },
    });

    this.logger.log({ ticketId: ticket.id, createdBy: ticket.createdBy }, 'Ticket created');

    await this.kafka.publish(KAFKA_TOPICS.TICKET_CREATED, {
      ticketId:   ticket.id,
      title:      ticket.title,
      category:   ticket.category,
      priority:   ticket.priority,
      createdBy:  ticket.createdBy,
      createdAt:  ticket.createdAt,
    });

    return ticket;
  }

  async findAll(filter: TicketFilterDto) {
    const where: Prisma.TicketWhereInput = {
      ...(filter.status     ? { status:     filter.status }     : {}),
      ...(filter.category   ? { category:   filter.category }   : {}),
      ...(filter.priority   ? { priority:   filter.priority }   : {}),
      ...(filter.createdBy  ? { createdBy:  filter.createdBy }  : {}),
      ...(filter.assignedTo ? { assignedTo: filter.assignedTo } : {}),
    };

    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        take:  filter.limit  ?? 20,
        skip:  filter.offset ?? 0,
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return { tickets, total, limit: filter.limit ?? 20, offset: filter.offset ?? 0 };
  }

  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException(`Ticket ${id} not found`);
    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto) {
    await this.findOne(id);

    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: {
        ...(dto.title       !== undefined ? { title:       dto.title }       : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.category    !== undefined ? { category:    dto.category }    : {}),
        ...(dto.priority    !== undefined ? { priority:    dto.priority }    : {}),
        ...(dto.status      !== undefined ? { status:      dto.status }      : {}),
        ...(dto.assignedTo  !== undefined ? { assignedTo:  dto.assignedTo }  : {}),
      },
    });

    this.logger.log({ ticketId: ticket.id, changes: dto }, 'Ticket updated');

    await this.kafka.publish(KAFKA_TOPICS.TICKET_UPDATED, {
      ticketId:   ticket.id,
      status:     ticket.status,
      assignedTo: ticket.assignedTo,
      updatedAt:  ticket.updatedAt,
    });

    return ticket;
  }

  async close(id: string) {
    const ticket = await this.findOne(id);

    if (ticket.status === TicketStatus.CLOSED) {
      throw new BadRequestException(`Ticket ${id} is already closed`);
    }

    const closed = await this.prisma.ticket.update({
      where: { id },
      data: {
        status:     TicketStatus.CLOSED,
        resolvedAt: new Date(),
      },
    });

    this.logger.log({ ticketId: closed.id }, 'Ticket closed');

    await this.kafka.publish(KAFKA_TOPICS.TICKET_CLOSED, {
      ticketId:   closed.id,
      createdBy:  closed.createdBy,
      assignedTo: closed.assignedTo,
      resolvedAt: closed.resolvedAt,
    });

    return closed;
  }

  async addMessage(ticketId: string, dto: CreateMessageDto) {
    // Verify ticket exists before posting a message
    await this.findOne(ticketId);

    const message = await this.prisma.ticketMessage.create({
      data: {
        ticketId,
        authorId:   dto.authorId,
        authorRole: dto.authorRole,
        content:    dto.content,
      },
    });

    this.logger.debug(
      { ticketId, messageId: message.id, authorRole: message.authorRole },
      'Message added to ticket',
    );

    return message;
  }

  async getMessages(ticketId: string) {
    // Verify ticket exists
    await this.findOne(ticketId);

    return this.prisma.ticketMessage.findMany({
      where:   { ticketId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
