import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { extractEventUser } from '../shared/event-user.helper';
import { IdentityUserSyncService } from '../shared/identity-user-sync.service';
import { StaffPresenceService } from '../shared/staff-presence.service';
import { ParsedWebhookEvent } from '../shared/webhook-event-parser.service';

@Injectable()
export class SessionEstablishedService {
  constructor(
    private readonly userSyncService: IdentityUserSyncService,
    private readonly staffPresenceService: StaffPresenceService,
  ) {}

  async handle(event: ParsedWebhookEvent) {
    const userPayload = extractEventUser(event.data);
    const profile = await this.userSyncService.syncUser(userPayload, {
      lastSessionActivityAt: event.issuedAt,
    });

    const isStaff = profile.role === UserRole.STAFF;
    if (isStaff) {
      await this.staffPresenceService.setOnlineStatus(profile.id, true);
    }

    return { profileId: profile.id, markedOnline: isStaff };
  }
}
