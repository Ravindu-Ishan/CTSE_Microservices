import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Observable } from 'rxjs';

@Injectable()
export class RequestPayloadLoggerInterceptor implements NestInterceptor {
  constructor(
    private readonly configService: ConfigService,
    @InjectPinoLogger(RequestPayloadLoggerInterceptor.name) private readonly logger: PinoLogger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const shouldLog = this.configService.get('LOG_REQUEST_BODY_DEBUG') === 'true';

    if (shouldLog) {
      const request = context.switchToHttp().getRequest();
      const { method, originalUrl, url, body } = request;

      this.logger.debug(
        { method, url: originalUrl ?? url, payload: body },
        'Incoming request payload',
      );
    }

    return next.handle();
  }
}
