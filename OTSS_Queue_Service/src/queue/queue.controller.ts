import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ManualAssignDto } from './dto/manual-assign.dto';
import { QueueFilterDto } from './dto/queue-filter.dto';
import { QueueService } from './queue.service';

@ApiTags('Queue')
@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  // ----------------------------------------------------------------
  // Observability — admin dashboard endpoints
  // ----------------------------------------------------------------

  @Get()
  @ApiOperation({ summary: 'List all queue entries with optional filters' })
  findAll(@Query() filter: QueueFilterDto) {
    return this.queueService.findAll(filter);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Queue stats — pending, assigned, failed, completed counts' })
  getStats() {
    return this.queueService.getStats();
  }

  @Get(':ticketId')
  @ApiOperation({ summary: 'Get queue entry for a specific ticket' })
  findByTicket(@Param('ticketId') ticketId: string) {
    return this.queueService.findByTicket(ticketId);
  }

  // ----------------------------------------------------------------
  // Manual assignment — admin override for high priority cases
  // ----------------------------------------------------------------

  @Post(':ticketId/assign')
  @ApiOperation({
    summary: 'Manually assign a ticket to a specific staff member',
    description:
      'Admin override — bypasses auto-assignment. ' +
      'Use for high priority tickets or VIP customers. ' +
      'If ticket was previously assigned, previous staff load is decremented.',
  })
  manualAssign(
    @Param('ticketId') ticketId: string,
    @Body() dto: ManualAssignDto,
  ) {
    return this.queueService.manualAssign(ticketId, dto);
  }
}
