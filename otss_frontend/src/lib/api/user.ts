import { userClient, authHeader } from './client';
import type { Profile, RegisterUserDto, UpdateStaffStatusDto, ProfileListParams, StaffStatusWithProfile, StaffListParams } from '../types/user';

export async function registerUser(data: RegisterUserDto): Promise<Profile> {
  const res = await userClient.post<Profile>('/users/register', data);
  return res.data;
}

export async function listProfiles(params?: ProfileListParams, token?: string): Promise<Profile[]> {
  const res = await userClient.get<Profile[]>('/profiles', { params, headers: authHeader(token) });
  return res.data;
}

export async function getProfile(id: string, token?: string): Promise<Profile> {
  const res = await userClient.get<Profile>(`/profiles/${id}`, { headers: authHeader(token) });
  return res.data;
}

export async function updateStaffStatus(profileId: string, data: UpdateStaffStatusDto, token?: string): Promise<Profile> {
  const res = await userClient.patch<Profile>(`/staff/isonline/${profileId}`, data, { headers: authHeader(token) });
  return res.data;
}

export async function listStaff(params?: StaffListParams, token?: string): Promise<StaffStatusWithProfile[]> {
  const res = await userClient.get<StaffStatusWithProfile[]>('/staff', { params, headers: authHeader(token) });
  return res.data;
}
