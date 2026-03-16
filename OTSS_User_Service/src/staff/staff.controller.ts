import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StaffFilterDto } from './dto/staff-filter.dto';
import { UpdateStaffStatusDto } from './dto/update-staff-status.dto';
import { StaffService } from './staff.service';

@ApiTags('Staff')
@Controller('staff')
export class StaffController {
	constructor(private readonly staffService: StaffService) {}

	@Get()
	@ApiOperation({ summary: 'Discover staff for assignment' })
	findStaff(@Query() filter: StaffFilterDto) {
		return this.staffService.findStaff(filter);
	}

	@Patch('isonline/:profileId')
	@ApiOperation({ summary: 'Update staff availability and capacity' })
	updateStatus(
		@Param('profileId', new ParseUUIDPipe()) profileId: string,
		@Body() payload: UpdateStaffStatusDto,
	) {
		return this.staffService.updateStatus(profileId, payload);
	}
}
