import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import { ProfilesService } from '../profiles/profiles.service';
import { Wso2ScimService } from '../wso2-scim/wso2-scim.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly endUserGroupName: string;

  constructor(
    private readonly wso2ScimService: Wso2ScimService,
    private readonly profilesService: ProfilesService,
    private readonly config: ConfigService,
  ) {
    this.endUserGroupName = this.config.getOrThrow<string>('WSO2_END_USER_GROUP');
  }

  async register(dto: RegisterUserDto) {
    const wso2Id = await this.wso2ScimService.createUser({
      username: dto.username,
      email: dto.email,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phoneNumber: dto.phoneNumber,
    });

    try {
      const groupId = await this.wso2ScimService.getGroupIdByName(this.endUserGroupName);
      await this.wso2ScimService.addUserToGroup(wso2Id, groupId, dto.username);

      return await this.profilesService.syncProfile({
        id: wso2Id,
        username: dto.username,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phoneNumber: dto.phoneNumber,
        timezone: dto.timezone,
        language: dto.language,
        role: UserRole.END_USER,
      });
    } catch (error: unknown) {
      this.logger.error({ wso2Id, error }, 'Post-creation setup failed — rolling back WSO2 user');
      await this.wso2ScimService.deleteUser(wso2Id);
      throw error;
    }
  }
}
