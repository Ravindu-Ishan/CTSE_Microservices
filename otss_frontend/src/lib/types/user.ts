import { TicketCategory } from './ticket';

export type UserRole = 'END_USER' | 'STAFF' | 'ADMIN';

export interface StaffStatus {
  id: string;
  profileId: string;
  isOnline: boolean;
  currentLoad: number;
  maxLoad: number;
  categories: TicketCategory[];
  updatedAt: string;
}

export interface Profile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  timezone?: string;
  language?: string;
  role: UserRole;
  lastLoginAt?: string;
  lastRegistrationAt?: string;
  lastTokenIssuedAt?: string;
  lastTokenRevokedAt?: string;
  lastSessionActivityAt?: string;
  lastCredentialUpdateAt?: string;
  createdAt: string;
  updatedAt: string;
  staffStatus?: StaffStatus | null;
}

export interface RegisterUserDto {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  timezone?: string;
  language?: string;
}

export interface UpdateStaffStatusDto {
  isOnline?: boolean;
  currentLoad?: number;
  maxLoad?: number;
  categories?: TicketCategory[];
}

export interface ProfileListParams {
  email?: string;
  role?: UserRole;
}
