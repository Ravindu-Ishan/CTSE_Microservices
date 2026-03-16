import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IamEventsDispatcherService } from './iam-events.dispatcher.service';
import { WebhookSignatureGuard } from './shared/webhook-signature.guard';

@ApiTags('IAM Events')
@Controller('events')
@UseGuards(WebhookSignatureGuard)
export class IamEventsController {
  constructor(private readonly dispatcher: IamEventsDispatcherService) {}

  @Post()
  @ApiOperation({ summary: 'WSO2 IAM event webhook — all event types' })
  handleEvent(@Body() payload: Record<string, unknown>) {
    return this.dispatcher.handle(payload);
  }
}
