import { BadRequestException } from '@nestjs/common';

export function extractEventUser(
  eventData: Record<string, unknown>,
): Record<string, unknown> {
  const rawUser = eventData.user;

  if (!rawUser || typeof rawUser !== 'object' || Array.isArray(rawUser)) {
    throw new BadRequestException('Event payload is missing its user object');
  }

  return rawUser as Record<string, unknown>;
}

export function extractEventUserId(eventData: Record<string, unknown>): string {
  const user = extractEventUser(eventData);
  const userId = user.id;

  if (typeof userId !== 'string' || userId.length === 0) {
    throw new BadRequestException('Event payload is missing the user identifier');
  }

  return userId;
}
