import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketFilterDto } from './dto/ticket-filter.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketsService } from './tickets.service';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new support ticket' })
  create(@Body() dto: CreateTicketDto) {
    return this.ticketsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List tickets with optional filters' })
  findAll(@Query() filter: TicketFilterDto) {
    return this.ticketsService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a ticket by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a ticket' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTicketDto,
  ) {
    return this.ticketsService.update(id, dto);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Close a ticket' })
  close(@Param('id', ParseUUIDPipe) id: string) {
    return this.ticketsService.close(id);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Post a message on a ticket — used by both end users and staff' })
  addMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.ticketsService.addMessage(id, dto);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get full conversation thread for a ticket' })
  getMessages(@Param('id', ParseUUIDPipe) id: string) {
    return this.ticketsService.getMessages(id);
  }
}
