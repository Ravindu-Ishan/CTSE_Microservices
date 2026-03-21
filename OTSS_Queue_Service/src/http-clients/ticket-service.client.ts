import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TicketServiceClient {
  private readonly logger = new Logger(TicketServiceClient.name);
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    configService: ConfigService,
  ) {
    this.baseUrl = configService.getOrThrow<string>('TICKET_SERVICE_URL');
  }

  async assignTicket(ticketId: string, staffId: string): Promise<void> {
    const url = `${this.baseUrl}/tickets/${ticketId}`;
    await firstValueFrom(
      this.http.patch(url, {
        assignedTo: staffId,
        status: 'IN_PROGRESS',
      }),
    );
    this.logger.debug({ ticketId, staffId }, 'Ticket assigned');
  }
}
