import { BadRequestException, Injectable, Logger } from '@nestjs/common';

export interface ParsedWebhookEvent {
  uri: string;
  data: Record<string, unknown>;
  issuedAt: Date;
}

@Injectable()
export class WebhookEventParserService {
  private readonly logger = new Logger(WebhookEventParserService.name);

  extract(
    payload: Record<string, unknown>,
    supportedUris: readonly string[],
  ): ParsedWebhookEvent[] {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('Webhook payload must be a JSON object');
    }

    const events = payload.events;

    if (!this.isRecord(events)) {
      throw new BadRequestException('Webhook payload is missing the events object');
    }

    const issuedAt = this.resolveIssuedAt(payload);
    const matches: ParsedWebhookEvent[] = [];

    for (const uri of supportedUris) {
      const rawEvent = events[uri];
      if (!rawEvent) {
        continue;
      }

      if (!this.isRecord(rawEvent)) {
        this.logger.warn(
          { uri },
          'Webhook event payload is not an object and will be ignored',
        );
        continue;
      }

      matches.push({ uri, data: rawEvent, issuedAt });
    }

    return matches;
  }

  private resolveIssuedAt(payload: Record<string, unknown>): Date {
    const rawTimestamp = payload.iat;

    if (typeof rawTimestamp === 'number' && Number.isFinite(rawTimestamp)) {
      return this.epochToDate(rawTimestamp);
    }

    if (typeof rawTimestamp === 'string' && rawTimestamp.trim().length > 0) {
      const parsed = Number(rawTimestamp);
      if (!Number.isNaN(parsed)) {
        return this.epochToDate(parsed);
      }
    }

    return new Date();
  }

  private epochToDate(epoch: number): Date {
    // WSO2 emits iat in milliseconds. Fall back to seconds when the value is small.
    if (epoch > 9999999999) {
      return new Date(epoch);
    }
    return new Date(epoch * 1000);
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }
}
