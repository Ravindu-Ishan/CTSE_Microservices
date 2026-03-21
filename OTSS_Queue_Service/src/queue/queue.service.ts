import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, QueueEntryStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UserServiceClient } from '../http-clients/user-service.client';
import { TicketServiceClient } from '../http-clients/ticket-service.client';
import { ManualAssignDto } from './dto/manual-assign.dto';
import { QueueFilterDto } from './dto/queue-filter.dto';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly userClient: UserServiceClient,
    private readonly ticketClient: TicketServiceClient,
  ) {}

  // ----------------------------------------------------------------
  // Kafka event handlers
  // ----------------------------------------------------------------

  async handleTicketCreated(payload: {
    ticketId:  string;
    category:  string;
    priority:  string;
    createdBy: string;
  }): Promise<void> {
    this.logger.log({ ticketId: payload.ticketId }, 'Processing ticket.created event');

    // Create queue entry in PENDING state
    await this.prisma.queueEntry.create({
      data: {
        ticketId:       payload.ticketId,
        ticketPriority: payload.priority   as any,
        ticketCategory: payload.category   as any,
        createdBy:      payload.createdBy,
        status:         QueueEntryStatus.PENDING,
      },
    });

    // Attempt auto-assignment
    await this.attemptAssignment(payload.ticketId, payload.category);
  }

  async handleTicketClosed(payload: {
    ticketId:   string;
    assignedTo: string | null;
  }): Promise<void> {
    this.logger.log({ ticketId: payload.ticketId }, 'Processing ticket.closed event');

    const entry = await this.prisma.queueEntry.findUnique({
      where: { ticketId: payload.ticketId },
    });

    if (!entry) {
      this.logger.warn({ ticketId: payload.ticketId }, 'Queue entry not found for closed ticket');
      return;
    }

    await this.prisma.queueEntry.update({
      where: { ticketId: payload.ticketId },
      data: {
        status:      QueueEntryStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    // Decrement staff load if ticket was assigned
    if (entry.assignedStaffId) {
      try {
        await this.userClient.decrementStaffLoad(entry.assignedStaffId);
      } catch (error) {
        this.logger.error(
          { staffId: entry.assignedStaffId, error },
          'Failed to decrement staff load on ticket close',
        );
      }
    }
  }

  // ----------------------------------------------------------------
  // Auto-assignment logic
  // ----------------------------------------------------------------

  private async attemptAssignment(ticketId: string, category: string): Promise<void> {
    try {
      const availableStaff = await this.userClient.getAvailableStaff(category);

      if (!availableStaff.length) {
        this.logger.warn({ ticketId, category }, 'No available staff — ticket remains PENDING');
        await this.prisma.queueEntry.update({
          where: { ticketId },
          data:  { status: QueueEntryStatus.FAILED },
        });
        return;
      }

      // Pick staff with lowest current load (User Service already returns sorted by load asc)
      const staff = availableStaff[0];

      await this.assign(ticketId, staff.profileId);
    } catch (error) {
      this.logger.error({ ticketId, error }, 'Auto-assignment failed');
      await this.prisma.queueEntry.update({
        where: { ticketId },
        data:  { status: QueueEntryStatus.FAILED },
      });
    }
  }

  private async assign(ticketId: string, staffId: string): Promise<void> {
    // Update ticket in Ticket Service
    await this.ticketClient.assignTicket(ticketId, staffId);

    // Increment staff load in User Service
    await this.userClient.incrementStaffLoad(staffId);

    // Update queue entry
    await this.prisma.queueEntry.update({
      where: { ticketId },
      data: {
        assignedStaffId: staffId,
        status:          QueueEntryStatus.ASSIGNED,
        assignedAt:      new Date(),
      },
    });

    this.logger.log({ ticketId, staffId }, 'Ticket assigned to staff');
  }

  // ----------------------------------------------------------------
  // Manual assignment — admin override for high priority cases
  // ----------------------------------------------------------------

  async manualAssign(ticketId: string, dto: ManualAssignDto): Promise<void> {
    const entry = await this.prisma.queueEntry.findUnique({
      where: { ticketId },
    });

    if (!entry) {
      throw new NotFoundException(`Queue entry for ticket ${ticketId} not found`);
    }

    if (entry.status === QueueEntryStatus.COMPLETED) {
      throw new BadRequestException(`Ticket ${ticketId} is already completed`);
    }

    // If previously assigned to someone else, decrement their load first
    if (entry.assignedStaffId && entry.assignedStaffId !== dto.staffId) {
      try {
        await this.userClient.decrementStaffLoad(entry.assignedStaffId);
      } catch (error) {
        this.logger.error(
          { staffId: entry.assignedStaffId, error },
          'Failed to decrement previous staff load on manual reassign',
        );
      }
    }

    await this.assign(ticketId, dto.staffId);
    this.logger.log({ ticketId, staffId: dto.staffId }, 'Manual assignment override applied');
  }

  // ----------------------------------------------------------------
  // Observability queries
  // ----------------------------------------------------------------

  async findAll(filter: QueueFilterDto) {
    const where: Prisma.QueueEntryWhereInput = {
      ...(filter.status          ? { status:          filter.status }          : {}),
      ...(filter.ticketPriority  ? { ticketPriority:  filter.ticketPriority }  : {}),
      ...(filter.ticketCategory  ? { ticketCategory:  filter.ticketCategory }  : {}),
      ...(filter.assignedStaffId ? { assignedStaffId: filter.assignedStaffId } : {}),
    };

    const [entries, total] = await Promise.all([
      this.prisma.queueEntry.findMany({
        where,
        orderBy: [{ ticketPriority: 'desc' }, { createdAt: 'asc' }],
        take:    filter.limit  ?? 20,
        skip:    filter.offset ?? 0,
      }),
      this.prisma.queueEntry.count({ where }),
    ]);

    return { entries, total, limit: filter.limit ?? 20, offset: filter.offset ?? 0 };
  }

  async findByTicket(ticketId: string) {
    const entry = await this.prisma.queueEntry.findUnique({
      where: { ticketId },
    });

    if (!entry) throw new NotFoundException(`Queue entry for ticket ${ticketId} not found`);
    return entry;
  }

  async getStats() {
    const [pending, assigned, failed, completed] = await Promise.all([
      this.prisma.queueEntry.count({ where: { status: QueueEntryStatus.PENDING } }),
      this.prisma.queueEntry.count({ where: { status: QueueEntryStatus.ASSIGNED } }),
      this.prisma.queueEntry.count({ where: { status: QueueEntryStatus.FAILED } }),
      this.prisma.queueEntry.count({ where: { status: QueueEntryStatus.COMPLETED } }),
    ]);

    return { pending, assigned, failed, completed, total: pending + assigned + failed + completed };
  }
}
