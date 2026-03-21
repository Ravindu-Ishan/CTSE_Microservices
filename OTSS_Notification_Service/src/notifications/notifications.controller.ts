import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get notification history for a user' })
  getByUser(@Param('userId') userId: string) {
    return this.notificationsService.getByUser(userId);
  }

  @Get('ticket/:ticketId')
  @ApiOperation({ summary: 'Get all notifications sent for a specific ticket' })
  getByTicket(@Param('ticketId') ticketId: string) {
    return this.notificationsService.getByTicket(ticketId);
  }
}
