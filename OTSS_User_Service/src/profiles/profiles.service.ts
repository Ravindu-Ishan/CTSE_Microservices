import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileQueryDto } from './dto/profile-query.dto';
import { StaffProfileInputDto } from './dto/staff-profile.dto';
import { SyncProfileDto } from './dto/sync-profile.dto';

type ProfileWithStaff = Prisma.UserProfileGetPayload<{ include: { staffStatus: true } }>;

@Injectable()
export class ProfilesService {
	constructor(private readonly prisma: PrismaService) {}

	async syncProfile(payload: SyncProfileDto): Promise<ProfileWithStaff> {
		const exists = await this.prisma.userProfile.findUnique({
			where: { id: payload.id },
		});

		if (exists) {
			return this.updateProfile(payload.id, payload);
		}

		return this.createProfile(payload);
	}

	async listProfiles(query: ProfileQueryDto): Promise<ProfileWithStaff[]> {
		return this.prisma.userProfile.findMany({
			where: {
				...(query.email ? { email: query.email } : {}),
				...(query.role ? { role: query.role } : {}),
			},
			include: { staffStatus: true },
			orderBy: { createdAt: 'desc' },
		});
	}

	async findProfileById(id: string): Promise<ProfileWithStaff> {
		const profile = await this.prisma.userProfile.findUnique({
			where: { id },
			include: { staffStatus: true },
		});

		if (!profile) {
			throw new NotFoundException(`Profile ${id} was not found`);
		}

		return profile;
	}

	async updateProfile(id: string, payload: SyncProfileDto): Promise<ProfileWithStaff> {
		return this.prisma.$transaction(async (tx) => {
			const updated = await tx.userProfile.update({
				where: { id },
				data: this.buildProfileUpdateData(payload),
			});

			const staffStatus = await this.syncStaffStatus(tx, id, updated.role === UserRole.STAFF, payload.staff);

			return { ...updated, staffStatus } as ProfileWithStaff;
		});
	}

	private async createProfile(payload: SyncProfileDto): Promise<ProfileWithStaff> {
		const isStaff = payload.role === UserRole.STAFF;
		const baseData = this.buildProfileCreateData(payload);

		return this.prisma.userProfile.create({
			data: {
				...baseData,
				staffStatus: isStaff ? { create: this.mapStaffStatus(payload.staff) } : undefined,
			},
			include: { staffStatus: true },
		});
	}

	private buildProfileCreateData(payload: SyncProfileDto) {
		return {
			id: payload.id,
			username: payload.username,
			email: payload.email,
			firstName: payload.firstName,
			lastName: payload.lastName,
			phoneNumber: payload.phoneNumber,
			timezone: payload.timezone,
			language: payload.language,
			role: payload.role as UserRole,
		} satisfies Prisma.UserProfileCreateInput;
	}

	private buildProfileUpdateData(payload: SyncProfileDto) {
		const data: Prisma.UserProfileUpdateInput = {};

		if (payload.email !== undefined) data.email = payload.email;
		if (payload.firstName !== undefined) data.firstName = payload.firstName;
		if (payload.lastName !== undefined) data.lastName = payload.lastName;
		if (payload.phoneNumber !== undefined) data.phoneNumber = payload.phoneNumber;
		if (payload.timezone !== undefined) data.timezone = payload.timezone;
		if (payload.language !== undefined) data.language = payload.language;
		if (payload.role !== undefined) data.role = payload.role;

		return data;
	}

	private async syncStaffStatus(
		tx: Prisma.TransactionClient,
		profileId: string,
		isStaff: boolean,
		staff?: StaffProfileInputDto,
	) {
		if (!isStaff) {
			await tx.supportStaffStatus.deleteMany({ where: { profileId } });
			return null;
		}

		if (!staff) {
			return tx.supportStaffStatus.findUnique({ where: { profileId } });
		}

		return tx.supportStaffStatus.upsert({
			where: { profileId },
			create: {
				profile: { connect: { id: profileId } },
				...this.mapStaffStatus(staff),
			},
			update: this.mapStaffStatus(staff),
		});
	}

	private mapStaffStatus(staff?: StaffProfileInputDto) {
		const safeStaff = staff ?? {};
		return {
			isOnline: safeStaff.isOnline ?? false,
			currentLoad: safeStaff.currentLoad ?? 0,
			maxLoad: safeStaff.maxLoad ?? 5,
			categories: safeStaff.categories ?? [],
		};
	}
}
