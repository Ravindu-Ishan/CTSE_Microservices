export const EVENT_URIS = {
  LOGIN_SUCCESS:
    'https://schemas.identity.wso2.org/events/login/event-type/loginSuccess',
  TOKEN_ISSUED:
    'https://schemas.identity.wso2.org/events/token/event-type/accessTokenIssued',
  TOKEN_REVOKED:
    'https://schemas.identity.wso2.org/events/token/event-type/accessTokenRevoked',
  SESSION_ESTABLISHED:
    'https://schemas.identity.wso2.org/events/session/event-type/sessionEstablished',
  SESSION_PRESENTED:
    'https://schemas.identity.wso2.org/events/session/event-type/sessionPresented',
  SESSION_REVOKED:
    'https://schemas.identity.wso2.org/events/session/event-type/sessionRevoked',
  CREDENTIAL_UPDATED:
    'https://schemas.identity.wso2.org/events/credential/event-type/credentialUpdated',
  USER_CREATED:
    'https://schemas.identity.wso2.org/events/user/event-type/userCreated',
  USER_PROFILE_UPDATED:
    'https://schemas.identity.wso2.org/events/user/event-type/userProfileUpdated',
  USER_DELETED:
    'https://schemas.identity.wso2.org/events/user/event-type/userDeleted',
} as const;

export const LOGIN_EVENT_URIS = [EVENT_URIS.LOGIN_SUCCESS] as const;
export const TOKEN_EVENT_URIS = [EVENT_URIS.TOKEN_ISSUED, EVENT_URIS.TOKEN_REVOKED] as const;
export const SESSION_EVENT_URIS = [
  EVENT_URIS.SESSION_ESTABLISHED,
  EVENT_URIS.SESSION_PRESENTED,
  EVENT_URIS.SESSION_REVOKED,
] as const;
export const CREDENTIAL_EVENT_URIS = [EVENT_URIS.CREDENTIAL_UPDATED] as const;
export const USER_MANAGEMENT_EVENT_URIS = [
  EVENT_URIS.USER_CREATED,
  EVENT_URIS.USER_PROFILE_UPDATED,
  EVENT_URIS.USER_DELETED,
] as const;

export const ALL_EVENT_URIS = [
  ...LOGIN_EVENT_URIS,
  ...TOKEN_EVENT_URIS,
  ...SESSION_EVENT_URIS,
  ...CREDENTIAL_EVENT_URIS,
  ...USER_MANAGEMENT_EVENT_URIS,
] as const;
