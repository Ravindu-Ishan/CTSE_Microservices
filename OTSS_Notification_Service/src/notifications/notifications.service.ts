import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationStatus, NotificationType } from '@prisma/client';
import { EmailService } from '../email/email.service';
import {
  ticketCreatedTemplate,
  ticketReplyTemplate,
  ticketClosedTemplate,
} from '../email/email.templates';
import { UserServiceClient } from '../http-clients/user-service.client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly appBaseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly userClient: UserServiceClient,
    configService: ConfigService,
  ) {
    this.appBaseUrl = configService.get<string>('APP_BASE_URL') ?? 'http://localhost:3000';
  }

  // ----------------------------------------------------------------
  // Kafka event handlers
  // ----------------------------------------------------------------

  async handleTicketCreated(payload: {
    ticketId:  string;
    title:     string;
    category:  string;
    priority:  string;
    createdBy: string;
  }): Promise<void> {
    const { email: creatorEmail } = await this.userClient.getUserProfile(payload.createdBy);
    const trackingUrl = `${this.appBaseUrl}/tickets/${payload.ticketId}`;
    const template = ticketCreatedTemplate({
      ticketId:    payload.ticketId,
      title:       payload.title,
      category:    payload.category,
      priority:    payload.priority,
      trackingUrl,
    });

    await this.sendAndLog({
      ticketId:        payload.ticketId,
      recipientEmail:  creatorEmail,
      recipientUserId: payload.createdBy,
      type:            NotificationType.TICKET_CREATED,
      subject:         template.subject,
      html:            template.html,
    });
  }

  async handleTicketUpdated(payload: {
    ticketId:    string;
    title:       string;
    lastMessage: string;
    createdBy:   string;
  }): Promise<void> {
    if (!payload.lastMessage) return;

    const { email: creatorEmail } = await this.userClient.getUserProfile(payload.createdBy);
    const trackingUrl = `${this.appBaseUrl}/tickets/${payload.ticketId}`;
    const template = ticketReplyTemplate({
      ticketId:    payload.ticketId,
      title:       payload.title,
      message:     payload.lastMessage,
      trackingUrl,
    });

    await this.sendAndLog({
      ticketId:        payload.ticketId,
      recipientEmail:  creatorEmail,
      recipientUserId: payload.createdBy,
      type:            NotificationType.TICKET_REPLY,
      subject:         template.subject,
      html:            template.html,
    });
  }

  async handleTicketClosed(payload: {
    ticketId:  string;
    title:     string;
    createdBy: string;
  }): Promise<void> {
    const { email: creatorEmail } = await this.userClient.getUserProfile(payload.createdBy);
    const trackingUrl = `${this.appBaseUrl}/tickets/${payload.ticketId}`;
    const template = ticketClosedTemplate({
      ticketId:    payload.ticketId,
      title:       payload.title,
      trackingUrl,
    });

    await this.sendAndLog({
      ticketId:        payload.ticketId,
      recipientEmail:  creatorEmail,
      recipientUserId: payload.createdBy,
      type:            NotificationType.TICKET_CLOSED,
      subject:         template.subject,
      html:            template.html,
    });
  }

  // ----------------------------------------------------------------
  // Observability — notification history
  // ----------------------------------------------------------------

  async getByUser(userId: string) {
    return this.prisma.notificationLog.findMany({
      where:   { recipientUserId: userId },
      orderBy: { sentAt: 'desc' },
    });
  }

  async getByTicket(ticketId: string) {
    return this.prisma.notificationLog.findMany({
      where:   { ticketId },
      orderBy: { sentAt: 'desc' },
    });
  }

  // ----------------------------------------------------------------
  // Internal helpers
  // ----------------------------------------------------------------

  private async sendAndLog(params: {
    ticketId:        string;
    recipientEmail:  string;
    recipientUserId: string;
    type:            NotificationType;
    subject:         string;
    html:            string;
  }): Promise<void> {
    let status: NotificationStatus = NotificationStatus.SENT;
    let errorMessage: string | undefined;

    try {
      await this.email.send({
        to:      params.recipientEmail,
        subject: params.subject,
        html:    params.html,
      });
    } catch (error: any) {
      status = NotificationStatus.FAILED;
      errorMessage = error?.message ?? 'Unknown error';
      this.logger.error(
        { ticketId: params.ticketId, to: params.recipientEmail, error },
        'Failed to send email notification',
      );
    }

    // Always log regardless of send success/failure
    await this.prisma.notificationLog.create({
      data: {
        ticketId:        params.ticketId,
        recipientEmail:  params.recipientEmail,
        recipientUserId: params.recipientUserId,
        type:            params.type,
        status,
        subject:         params.subject,
        errorMessage,
      },
    });
  }
}
