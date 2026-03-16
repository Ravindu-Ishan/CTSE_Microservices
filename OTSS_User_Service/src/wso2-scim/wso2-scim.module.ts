import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { Agent } from 'https';
import { Wso2ScimService } from './wso2-scim.service';

@Module({
  imports: [
    HttpModule.register({
      httpsAgent: new Agent({ rejectUnauthorized: false }),
    }),
  ],
  providers: [Wso2ScimService],
  exports: [Wso2ScimService],
})
export class Wso2ScimModule {}
