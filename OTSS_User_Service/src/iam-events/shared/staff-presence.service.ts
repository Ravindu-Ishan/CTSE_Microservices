import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { StaffService } from '../../staff/staff.service';

@Injectable()
export class StaffPresenceService {
  private readonly logger = new Logger(StaffPresenceService.name);

  constructor(private readonly staffService: StaffService) {}

  async setOnlineStatus(profileId: string, isOnline: boolean): Promise<void> {
    try {
      await this.staffService.updateStatus(profileId, { isOnline });
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.debug({ profileId }, 'Ignoring presence change for non-staff profile');
        return;
      }
      throw error;
    }
  }
}
