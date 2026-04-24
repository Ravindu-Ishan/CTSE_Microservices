import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StaffFilterDto } from './dto/staff-filter.dto';
import { UpdateStaffStatusDto } from './dto/update-staff-status.dto';

@Injectable()
export class StaffService {
	constructor(private readonly prisma: PrismaService) {}

	async findStaff(filter: StaffFilterDto) {
		const limit = filter.limit ?? 20;

		const candidates = await this.prisma.supportStaffStatus.findMany({
			where: {
				profile: { role: UserRole.STAFF },
				...(filter.category ? { categories: { has: filter.category } } : {}),
				...(filter.isOnline !== undefined ? { isOnline: filter.isOnline } : {}),
			},
			include: { profile: true },
			orderBy: [{ currentLoad: 'asc' }, { updatedAt: 'asc' }],
			take: limit * (filter.hasCapacity ? 2 : 1),
		});

		const filtered = filter.hasCapacity
			? candidates.filter((candidate) => candidate.currentLoad < candidate.maxLoad)
			: candidates;

		return filtered.slice(0, limit);
	}

	async updateStatus(profileId: string, payload: UpdateStaffStatusDto) {
		const profile = await this.prisma.userProfile.findUnique({ where: { id: profileId } });

		if (!profile || profile.role !== UserRole.STAFF) {
			throw new NotFoundException(`Support staff profile ${profileId} was not found or is inactive`);
		}

		const record = await this.prisma.supportStaffStatus.upsert({
			where: { profileId },
			create: this.buildCreateStatusInput(profileId, payload),
			update: this.buildUpdateStatusInput(payload),
			include: { profile: true },
		});

		return record;
	}

	private buildCreateStatusInput(profileId: string, payload: UpdateStaffStatusDto): Prisma.SupportStaffStatusCreateInput {
		const currentLoad = typeof payload.currentLoad === 'number' ? payload.currentLoad : 0;
		return {
			profile: { connect: { id: profileId } },
			isOnline: payload.isOnline ?? false,
			currentLoad,
			maxLoad: payload.maxLoad ?? 5,
			categories: payload.categories ?? [],
		};
	}

	private buildUpdateStatusInput(payload: UpdateStaffStatusDto): Prisma.SupportStaffStatusUpdateInput {
		const data: Prisma.SupportStaffStatusUpdateInput = {};

		if (payload.isOnline !== undefined) data.isOnline = payload.isOnline;
		if (payload.currentLoad !== undefined) {
			if (payload.currentLoad === 'increment') {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				data.currentLoad = { increment: 1 } as any;
			} else if (payload.currentLoad === 'decrement') {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				data.currentLoad = { decrement: 1 } as any;
			} else {
				data.currentLoad = payload.currentLoad;
			}
		}
		if (payload.maxLoad !== undefined) data.maxLoad = payload.maxLoad;
		if (payload.categories !== undefined) data.categories = payload.categories;

		return data;
	}
}
