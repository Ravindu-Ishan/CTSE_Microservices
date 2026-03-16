import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StaffModule } from '../staff/staff.module';
import { CredentialUpdatedService } from './credential/credential-updated.service';
import { IamEventsController } from './iam-events.controller';
import { IamEventsDispatcherService } from './iam-events.dispatcher.service';
import { LoginSuccessService } from './login/login-success.service';
import { SessionEstablishedService } from './session/session-established.service';
import { SessionPresentedService } from './session/session-presented.service';
import { SessionRevokedService } from './session/session-revoked.service';
import { IdentityUserSyncService } from './shared/identity-user-sync.service';
import { StaffPresenceService } from './shared/staff-presence.service';
import { WebhookEventParserService } from './shared/webhook-event-parser.service';
import { WebhookSignatureGuard } from './shared/webhook-signature.guard';
import { AccessTokenIssuedService } from './token/access-token-issued.service';
import { AccessTokenRevokedService } from './token/access-token-revoked.service';
import { UserCreatedService } from './user/user-created.service';
import { UserDeletedService } from './user/user-deleted.service';
import { UserProfileUpdatedService } from './user/user-profile-updated.service';

@Module({
  imports: [PrismaModule, StaffModule],
  controllers: [IamEventsController],
  providers: [
    WebhookSignatureGuard,
    WebhookEventParserService,
    IdentityUserSyncService,
    StaffPresenceService,
    IamEventsDispatcherService,
    LoginSuccessService,
    AccessTokenIssuedService,
    AccessTokenRevokedService,
    SessionEstablishedService,
    SessionPresentedService,
    SessionRevokedService,
    CredentialUpdatedService,
    UserCreatedService,
    UserProfileUpdatedService,
    UserDeletedService,
  ],
})
export class IamEventsModule {}
