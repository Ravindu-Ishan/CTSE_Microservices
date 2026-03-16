import { Module } from '@nestjs/common';
import { ProfilesModule } from '../profiles/profiles.module';
import { Wso2ScimModule } from '../wso2-scim/wso2-scim.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [Wso2ScimModule, ProfilesModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
