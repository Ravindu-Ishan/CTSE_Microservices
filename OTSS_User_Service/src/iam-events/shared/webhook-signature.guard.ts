import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { Request } from 'express';

@Injectable()
export class WebhookSignatureGuard implements CanActivate {
  private readonly logger = new Logger(WebhookSignatureGuard.name);
  private readonly secret: string | undefined;

  constructor(private readonly config: ConfigService) {
    this.secret = this.config.get<string>('WSO2_WEBHOOK_SECRET');
  }

  canActivate(context: ExecutionContext): boolean {
    if (!this.secret) {
      this.logger.warn('WSO2_WEBHOOK_SECRET is not set — skipping webhook signature verification');
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { rawBody?: Buffer }>();
    const signature = request.headers['x-wso2-signature'] as string | undefined;

    if (!signature) {
      throw new UnauthorizedException('Missing X-WSO2-Signature header');
    }

    const rawBody = request.rawBody;
    if (!rawBody) {
      throw new UnauthorizedException('Raw body unavailable for signature verification');
    }

    const [algorithm, hash] = signature.split('=');
    if (algorithm !== 'sha256' || !hash) {
      throw new UnauthorizedException('Invalid signature format — expected sha256=<hash>');
    }

    const expected = createHmac('sha256', this.secret)
      .update(rawBody)
      .digest('hex');

    const expectedBuffer = Buffer.from(expected, 'hex');
    const receivedBuffer = Buffer.from(hash, 'hex');

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      this.logger.warn('Webhook signature mismatch — request rejected');
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return true;
  }
}
