import { Injectable, Logger } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Wso2ScimService } from '../../wso2-scim/wso2-scim.service';
import { extractEventUser, extractEventUserId } from '../shared/event-user.helper';
import { IdentityUserSyncService } from '../shared/identity-user-sync.service';
import { StaffPresenceService } from '../shared/staff-presence.service';
import { ParsedWebhookEvent } from '../shared/webhook-event-parser.service';

@Injectable()
export class LoginSuccessService {
  private readonly logger = new Logger(LoginSuccessService.name);

  constructor(
    private readonly userSyncService: IdentityUserSyncService,
    private readonly staffPresenceService: StaffPresenceService,
    private readonly wso2ScimService: Wso2ScimService,
  ) {}

  async handle(event: ParsedWebhookEvent) {
    const userPayload = extractEventUser(event.data);
    const userId = extractEventUserId(event.data);

    let groups: string[] | undefined;
    try {
      groups = await this.wso2ScimService.getUserGroups(userId);
    } catch (err) {
      this.logger.warn({ userId, err }, 'Failed to fetch WSO2 groups on login — role will fall back to claim-based resolution');
    }

    const profile = await this.userSyncService.syncUser(userPayload, { lastLoginAt: event.issuedAt }, groups);

    const isStaff = profile.role === UserRole.STAFF;
    if (isStaff) {
      await this.staffPresenceService.setOnlineStatus(profile.id, true);
    }

    return { profileId: profile.id, markedOnline: isStaff };
  }
}
