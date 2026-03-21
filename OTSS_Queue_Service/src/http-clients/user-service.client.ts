import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface StaffMember {
  profileId: string;
  isOnline:  boolean;
  currentLoad: number;
  maxLoad:   number;
  categories: string[];
}

@Injectable()
export class UserServiceClient {
  private readonly logger = new Logger(UserServiceClient.name);
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    configService: ConfigService,
  ) {
    this.baseUrl = configService.getOrThrow<string>('USER_SERVICE_URL');
  }

  async getAvailableStaff(category: string): Promise<StaffMember[]> {
    const url = `${this.baseUrl}/staff`;
    const { data } = await firstValueFrom(
      this.http.get(url, {
        params: { isOnline: true, hasCapacity: true, category },
      }),
    );
    this.logger.debug({ category, count: data.length }, 'Fetched available staff');
    return data;
  }

  async incrementStaffLoad(staffId: string): Promise<void> {
    const url = `${this.baseUrl}/staff/isonline/${staffId}`;
    await firstValueFrom(
      this.http.patch(url, { currentLoad: 'increment' }),
    );
    this.logger.debug({ staffId }, 'Incremented staff load');
  }

  async decrementStaffLoad(staffId: string): Promise<void> {
    const url = `${this.baseUrl}/staff/isonline/${staffId}`;
    await firstValueFrom(
      this.http.patch(url, { currentLoad: 'decrement' }),
    );
    this.logger.debug({ staffId }, 'Decremented staff load');
  }
}
