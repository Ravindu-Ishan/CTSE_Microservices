import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { RequestPayloadLoggerInterceptor } from './common/interceptors/request-payload-logger.interceptor';
import { PrismaModule } from './prisma/prisma.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        redact: ['req.headers.authorization'],
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                targets: [
                  {
                    target: 'pino-pretty',
                    options: { colorize: true, singleLine: true },
                    level: process.env.LOG_LEVEL ?? 'info',
                  },
                  ...(process.env.LOG_TO_FILE === 'true'
                    ? [
                        {
                          target: 'pino/file',
                          options: { destination: 'logs/server.log', mkdir: true },
                          level: 'debug',
                        },
                      ]
                    : []),
                ],
              }
            : undefined,
      },
    }),
    PrismaModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestPayloadLoggerInterceptor,
    },
  ],
})
export class AppModule {}
