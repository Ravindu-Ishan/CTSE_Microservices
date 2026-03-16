import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProfileQueryDto } from './dto/profile-query.dto';
import { ProfilesService } from './profiles.service';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
	constructor(private readonly profilesService: ProfilesService) {}

	@Get()
	@ApiOperation({ summary: 'List profiles' })
	listProfiles(@Query() query: ProfileQueryDto) {
		return this.profilesService.listProfiles(query);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Fetch a profile by ID' })
	getProfile(@Param('id') id: string) {
		return this.profilesService.findProfileById(id);
	}
}
