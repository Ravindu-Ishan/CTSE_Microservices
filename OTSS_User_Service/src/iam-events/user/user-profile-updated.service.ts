import { Injectable, Logger } from '@nestjs/common';
import { Wso2ScimService } from '../../wso2-scim/wso2-scim.service';
import { extractEventUser, extractEventUserId } from '../shared/event-user.helper';
import { IdentityUserSyncService } from '../shared/identity-user-sync.service';
import { ParsedWebhookEvent } from '../shared/webhook-event-parser.service';

@Injectable()
export class UserProfileUpdatedService {
  private readonly logger = new Logger(UserProfileUpdatedService.name);

  constructor(
    private readonly userSyncService: IdentityUserSyncService,
    private readonly wso2ScimService: Wso2ScimService,
  ) {}

  async handle(event: ParsedWebhookEvent) {
    const userPayload = extractEventUser(event.data);
    const userId = extractEventUserId(event.data);

    let groups: string[] | undefined;
    try {
      groups = await this.wso2ScimService.getUserGroups(userId);
    } catch (err) {
      this.logger.warn({ userId, err }, 'Failed to fetch WSO2 groups — role will fall back to claim-based resolution');
    }

    const profile = await this.userSyncService.syncUser(userPayload, undefined, groups);
    return { profileId: profile.id };
  }
}
