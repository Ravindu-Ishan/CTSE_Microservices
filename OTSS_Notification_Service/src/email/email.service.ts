import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface SendEmailOptions {
  to:      string;
  subject: string;
  html:    string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter;
  private readonly fromAddress: string;

  constructor(configService: ConfigService) {
    const user = configService.getOrThrow<string>('GMAIL_USER');
    const pass = configService.getOrThrow<string>('GMAIL_APP_PASSWORD');

    this.fromAddress = `OTSS Support <${user}>`;

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  async send(options: SendEmailOptions): Promise<void> {
    await this.transporter.sendMail({
      from:    this.fromAddress,
      to:      options.to,
      subject: options.subject,
      html:    options.html,
    });

    this.logger.log({ to: options.to, subject: options.subject }, 'Email sent');
  }
}
