import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface UserProfile {
  id:          string;
  username:    string;
  email:       string;
  firstName:   string;
  lastName:    string;
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

  async getUserProfile(userId: string): Promise<UserProfile> {
    const url = `${this.baseUrl}/profiles/${userId}`;

    // Simple retry — 3 attempts with exponential backoff
    // 300ms → 600ms → 1200ms
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const { data } = await firstValueFrom(
          this.http.get<UserProfile>(url),
        );
        this.logger.debug({ userId, email: data.email }, 'Fetched user profile');
        return data;
      } catch (error: any) {
        const isLast = attempt === maxAttempts;

        if (isLast) {
          this.logger.error(
            { userId, attempt, error: error?.message },
            'Failed to fetch user profile after all retries',
          );
          throw error;
        }

        const delay = 300 * Math.pow(2, attempt - 1); // 300, 600, 1200
        this.logger.warn(
          { userId, attempt, delay },
          'User service call failed — retrying',
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // TypeScript requires this but it's unreachable
    throw new Error('Unreachable');
  }
}
