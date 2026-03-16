import { Injectable } from '@nestjs/common';
import { extractEventUser } from '../shared/event-user.helper';
import { IdentityUserSyncService } from '../shared/identity-user-sync.service';
import { ParsedWebhookEvent } from '../shared/webhook-event-parser.service';

@Injectable()
export class AccessTokenIssuedService {
  constructor(private readonly userSyncService: IdentityUserSyncService) {}

  async handle(event: ParsedWebhookEvent) {
    const userPayload = extractEventUser(event.data);
    const profile = await this.userSyncService.syncUser(userPayload, {
      lastTokenIssuedAt: event.issuedAt,
    });
    return { profileId: profile.id };
  }
}
