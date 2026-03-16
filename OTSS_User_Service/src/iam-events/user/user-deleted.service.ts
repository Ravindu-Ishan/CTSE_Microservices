import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { extractEventUserId } from '../shared/event-user.helper';
import { ParsedWebhookEvent } from '../shared/webhook-event-parser.service';

@Injectable()
export class UserDeletedService {
  private readonly logger = new Logger(UserDeletedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async handle(event: ParsedWebhookEvent) {
    const userId = extractEventUserId(event.data);

    try {
      await this.prisma.userProfile.delete({ where: { id: userId } });
      return { profileId: userId, deleted: true };
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        this.logger.debug({ userId }, 'User profile already deleted — acknowledging event');
        return { profileId: userId, deleted: false };
      }
      throw error;
    }
  }
}
