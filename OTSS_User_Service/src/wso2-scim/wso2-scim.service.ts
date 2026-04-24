import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface Wso2UserPayload {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

interface TokenCache {
  token: string;
  expiresAt: number;
}

@Injectable()
export class Wso2ScimService {
  private readonly logger = new Logger(Wso2ScimService.name);
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private tokenCache: TokenCache | null = null;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = this.config.getOrThrow<string>('WSO2_SCIM_BASE_URL');
    this.clientId = this.config.getOrThrow<string>('WSO2_CLIENT_ID');
    this.clientSecret = this.config.getOrThrow<string>('WSO2_CLIENT_SECRET');
  }

  private async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.tokenCache && this.tokenCache.expiresAt > now) {
      return this.tokenCache.token;
    }

    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const response = await firstValueFrom(
      this.httpService.post(
        `${this.baseUrl}/oauth2/token`,
        new URLSearchParams({ grant_type: 'client_credentials', scope: 'internal_user_mgt_create internal_user_mgt_view internal_user_mgt_delete internal_group_mgt_view internal_group_mgt_update' }),
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      ),
    );

    const { access_token, expires_in } = response.data as { access_token: string; expires_in: number };

    // Subtract 30s buffer so we refresh before actual expiry
    this.tokenCache = { token: access_token, expiresAt: now + (expires_in - 30) * 1000 };
    return access_token;
  }

  async getGroupIdByName(groupName: string): Promise<string> {
    const token = await this.getAccessToken();
    const response = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/scim2/Groups`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { filter: `displayName eq ${groupName}`, attributes: 'id,displayName' },
      }),
    );

    const groupId: string | undefined = (response.data as { Resources?: { id: string }[] }).Resources?.[0]?.id;
    if (!groupId) {
      throw new InternalServerErrorException(`WSO2 group '${groupName}' not found`);
    }

    return groupId;
  }

  async addUserToGroup(userId: string, groupId: string, username: string): Promise<void> {
    const token = await this.getAccessToken();
    await firstValueFrom(
      this.httpService.patch(
        `${this.baseUrl}/scim2/Groups/${groupId}`,
        {
          schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
          Operations: [{ op: 'add', value: { members: [{ display: username, value: userId }] } }],
        },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/scim+json' } },
      ),
    );
    this.logger.log({ userId, groupId }, 'User added to WSO2 group');
  }

  async createUser(payload: Wso2UserPayload): Promise<string> {
    const body = this.buildScimUserBody(payload);

    try {
      const token = await this.getAccessToken();
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/scim2/Users`, body, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      const wso2Id: string = response.data?.id;
      if (!wso2Id) {
        throw new InternalServerErrorException('WSO2 did not return a user ID after provisioning');
      }

      this.logger.log({ wso2Id }, 'User provisioned to WSO2');
      return wso2Id;
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number; data?: unknown } };
      this.logger.error(
        { wso2Status: axiosError.response?.status, wso2Response: axiosError.response?.data },
        'Failed to provision user to WSO2',
      );
      throw new InternalServerErrorException('Failed to provision user to WSO2 identity store');
    }
  }

  async getUserGroups(userId: string): Promise<string[]> {
    const token = await this.getAccessToken();
    const response = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/scim2/Users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { attributes: 'groups' },
      }),
    );

    const groups = (response.data as { groups?: { display: string }[] }).groups ?? [];
    return groups.map((g) => g.display).filter(Boolean);
  }

  async deleteUser(wso2Id: string): Promise<void> {
    try {
      const token = await this.getAccessToken();
      await firstValueFrom(
        this.httpService.delete(`${this.baseUrl}/scim2/Users/${wso2Id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      this.logger.log({ wso2Id }, 'User removed from WSO2');
    } catch (error: unknown) {
      this.logger.warn({ wso2Id, error }, 'Failed to remove user from WSO2 during rollback');
    }
  }

  private buildScimUserBody(payload: Wso2UserPayload) {
    const body: Record<string, unknown> = {
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      userName: `PRIMARY/${payload.username}`,
      password: payload.password,
      name: {
        givenName: payload.firstName,
        familyName: payload.lastName,
      },
      emails: [{ value: payload.email, primary: true }],
    };

    if (payload.phoneNumber) {
      body.phoneNumbers = [{ value: payload.phoneNumber, type: 'mobile' }];
    }

    return body;
  }
}
