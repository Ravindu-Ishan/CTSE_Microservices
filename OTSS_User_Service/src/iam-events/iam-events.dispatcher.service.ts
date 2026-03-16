import { Injectable } from '@nestjs/common';
import { CredentialUpdatedService } from './credential/credential-updated.service';
import { ALL_EVENT_URIS, EVENT_URIS } from './event-uris';
import { LoginSuccessService } from './login/login-success.service';
import { SessionEstablishedService } from './session/session-established.service';
import { SessionPresentedService } from './session/session-presented.service';
import { SessionRevokedService } from './session/session-revoked.service';
import { ParsedWebhookEvent, WebhookEventParserService } from './shared/webhook-event-parser.service';
import { AccessTokenIssuedService } from './token/access-token-issued.service';
import { AccessTokenRevokedService } from './token/access-token-revoked.service';
import { UserCreatedService } from './user/user-created.service';
import { UserDeletedService } from './user/user-deleted.service';
import { UserProfileUpdatedService } from './user/user-profile-updated.service';

@Injectable()
export class IamEventsDispatcherService {
  constructor(
    private readonly parser: WebhookEventParserService,
    private readonly loginSuccessService: LoginSuccessService,
    private readonly accessTokenIssuedService: AccessTokenIssuedService,
    private readonly accessTokenRevokedService: AccessTokenRevokedService,
    private readonly sessionEstablishedService: SessionEstablishedService,
    private readonly sessionPresentedService: SessionPresentedService,
    private readonly sessionRevokedService: SessionRevokedService,
    private readonly credentialUpdatedService: CredentialUpdatedService,
    private readonly userCreatedService: UserCreatedService,
    private readonly userProfileUpdatedService: UserProfileUpdatedService,
    private readonly userDeletedService: UserDeletedService,
  ) {}

  async handle(payload: Record<string, unknown>) {
    const events = this.parser.extract(payload, ALL_EVENT_URIS);
    let processed = 0;

    for (const event of events) {
      await this.dispatch(event);
      processed += 1;
    }

    return { received: events.length, processed };
  }

  private dispatch(event: ParsedWebhookEvent) {
    switch (event.uri) {
      case EVENT_URIS.LOGIN_SUCCESS:
        return this.loginSuccessService.handle(event);
      case EVENT_URIS.TOKEN_ISSUED:
        return this.accessTokenIssuedService.handle(event);
      case EVENT_URIS.TOKEN_REVOKED:
        return this.accessTokenRevokedService.handle(event);
      case EVENT_URIS.SESSION_ESTABLISHED:
        return this.sessionEstablishedService.handle(event);
      case EVENT_URIS.SESSION_PRESENTED:
        return this.sessionPresentedService.handle(event);
      case EVENT_URIS.SESSION_REVOKED:
        return this.sessionRevokedService.handle(event);
      case EVENT_URIS.CREDENTIAL_UPDATED:
        return this.credentialUpdatedService.handle(event);
      case EVENT_URIS.USER_CREATED:
        return this.userCreatedService.handle(event);
      case EVENT_URIS.USER_PROFILE_UPDATED:
        return this.userProfileUpdatedService.handle(event);
      case EVENT_URIS.USER_DELETED:
        return this.userDeletedService.handle(event);
      default:
        return Promise.resolve();
    }
  }
}
