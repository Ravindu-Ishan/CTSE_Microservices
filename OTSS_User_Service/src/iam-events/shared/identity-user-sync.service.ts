import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserProfile, UserRole } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { EventUserDto } from '../dto/event-user.dto';

const CLAIM_URIS = {
  EMAIL: [
    'http://wso2.org/claims/emailaddress',
    'http://wso2.org/claims/username',
  ],
  USERNAME: ['http://wso2.org/claims/username'],
  FIRST_NAME: [
    'http://wso2.org/claims/givenname',
    'http://wso2.org/claims/firstname',
  ],
  LAST_NAME: ['http://wso2.org/claims/lastname'],
  PHONE: ['http://wso2.org/claims/telephone', 'http://wso2.org/claims/mobile'],
  TIMEZONE: ['http://wso2.org/claims/timezone'],
  LANGUAGE: [
    'http://wso2.org/claims/preferredlanguage',
    'http://wso2.org/claims/locale',
  ],
  ROLES: ['http://wso2.org/claims/role'],
} as const;

export interface TimelineUpdates {
  lastLoginAt?: Date;
  lastRegistrationAt?: Date;
  lastTokenIssuedAt?: Date;
  lastTokenRevokedAt?: Date;
  lastSessionActivityAt?: Date;
  lastCredentialUpdateAt?: Date;
}

@Injectable()
export class IdentityUserSyncService {
  private readonly logger = new Logger(IdentityUserSyncService.name);
  private readonly staffGroupName: string;
  private readonly adminGroupName: string | undefined;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.staffGroupName = this.config.getOrThrow<string>('WSO2_STAFF_GROUP');
    this.adminGroupName = this.config.get<string>('WSO2_ADMIN_GROUP');
  }

  async syncUser(userPayload: unknown, timeline?: TimelineUpdates, groups?: string[]): Promise<UserProfile> {
    const dto = this.validateUserPayload(userPayload);
    const existing = await this.prisma.userProfile.findUnique({ where: { id: dto.id } });
    const claimMap = this.buildClaimMap(dto);
    const profileData = this.buildProfileData(claimMap, existing ?? undefined, groups);
    const timelineData = this.stripUndefined(timeline ?? {});

    return this.prisma.userProfile.upsert({
      where: { id: dto.id },
      create: {
        id: dto.id,
        ...this.stripUndefined({ ...profileData, ...timelineData }),
        username: (profileData as { username?: string }).username ?? dto.id,
      },
      update: this.stripUndefined({ ...profileData, ...timelineData }),
    });
  }

  private validateUserPayload(payload: unknown): EventUserDto {
    const instance = plainToInstance(EventUserDto, payload);
    const errors = validateSync(instance, { whitelist: true, forbidUnknownValues: true });

    if (errors.length > 0) {
      this.logger.warn({ errors }, 'Invalid user payload received from webhook');
      throw new BadRequestException('Webhook payload is missing required user claims');
    }

    return instance;
  }

  private buildClaimMap(user: EventUserDto): Map<string, string> {
    const aggregated = new Map<string, string>();

    const applyClaims = (claims?: typeof user.claims) => {
      if (!claims) return;
      for (const claim of claims) {
        if (!claim || typeof claim.uri !== 'string') continue;
        aggregated.set(claim.uri, claim.value);
      }
    };

    applyClaims(user.claims);
    applyClaims(user.addedClaims);
    applyClaims(user.updatedClaims);

    return aggregated;
  }

  private buildProfileData(claimMap: Map<string, string>, existing?: UserProfile, groups?: string[]) {
    const username =
      this.resolveClaim(claimMap, CLAIM_URIS.USERNAME) ??
      existing?.username ??
      undefined;
    const email =
      this.resolveClaim(claimMap, CLAIM_URIS.EMAIL) ?? existing?.email ?? username ?? '';

    if (!email) {
      throw new BadRequestException('Unable to derive an email for the incoming user');
    }

    const firstName =
      this.resolveClaim(claimMap, CLAIM_URIS.FIRST_NAME) ??
      existing?.firstName ??
      this.deriveFallbackFirstName(username || email);
    const lastName =
      this.resolveClaim(claimMap, CLAIM_URIS.LAST_NAME) ??
      existing?.lastName ??
      this.deriveFallbackLastName(username || email);

    const phoneNumber = this.resolveClaim(claimMap, CLAIM_URIS.PHONE) ?? existing?.phoneNumber;
    const timezone = this.resolveClaim(claimMap, CLAIM_URIS.TIMEZONE) ?? existing?.timezone;
    const language = this.resolveClaim(claimMap, CLAIM_URIS.LANGUAGE) ?? existing?.language;

    const roleTokens = this.parseRoleTokens(this.resolveClaim(claimMap, CLAIM_URIS.ROLES));
    const role = this.resolveRole(roleTokens, existing?.role, groups);

    return this.stripUndefined({ username: username || undefined, email, firstName, lastName, phoneNumber, timezone, language, role });
  }

  private resolveClaim(claimMap: Map<string, string>, candidates: readonly string[]): string | undefined {
    for (const uri of candidates) {
      const value = claimMap.get(uri);
      if (value && value.trim().length > 0) return value.trim();
    }
    return undefined;
  }

  private parseRoleTokens(rawValue?: string): string[] {
    if (!rawValue) return [];
    return rawValue
      .split(/[,\s]/)
      .map((token) => token.trim().toUpperCase())
      .filter((token) => token.length > 0);
  }

  private resolveRole(tokens: string[], currentRole?: UserRole, groups?: string[]): UserRole {
    if (groups !== undefined) {
      this.logger.log({ groups, staffGroupName: this.staffGroupName }, 'Resolving role from WSO2 groups');
      if (this.adminGroupName && groups.includes(this.adminGroupName)) return UserRole.ADMIN;
      if (groups.includes(this.staffGroupName)) return UserRole.STAFF;
      return UserRole.END_USER;
    }
    if (tokens.includes('ADMIN')) return UserRole.ADMIN;
    if (tokens.includes('STAFF')) return UserRole.STAFF;
    return currentRole ?? UserRole.END_USER;
  }

  private deriveFallbackFirstName(source: string): string {
    if (!source) return 'User';
    const sanitized = source.replace(/[@._-]/g, ' ').trim();
    return sanitized.split(' ')[0] || 'User';
  }

  private deriveFallbackLastName(source: string): string {
    if (!source) return 'Account';
    const sanitized = source.replace(/[@._-]/g, ' ').trim();
    const parts = sanitized.split(' ').filter((part) => part.length > 0);
    return parts.length > 1 ? parts[parts.length - 1] : 'Account';
  }

  private stripUndefined<T extends object>(value: T): T {
    const clone = { ...value } as T;
    (Object.keys(clone) as Array<keyof T>).forEach((key) => {
      if (clone[key] === undefined) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete clone[key];
      }
    });
    return clone;
  }
}
