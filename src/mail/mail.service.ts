import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import { dirname, join } from 'path';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  private async renderEmailTemplate(templateName: string, variables: Record<string, any>): Promise<string> {
    const basePath = dirname(require.main!.filename);
    const templatePath = this.configService.get<string>(`${templateName}.templatePath`);

    const fullPath = join(basePath, templatePath!);

    const templateFile = fs.readFileSync(fullPath, { encoding: 'utf-8' });
    const template = handlebars.compile(templateFile);
    return template(variables);
  }

  private async sendEmail(
    to: string,
    username: string,
    verificationUrl: string,
    type: 'verification' | 'passwordReset',
  ): Promise<void> {
    const subject = this.configService.get<string>(`${type}.subject`);
    const html = await this.renderEmailTemplate(type, { username, verificationUrl });

    try {
      await this.mailerService.sendMail({ to, subject, html });
      this.logger.log('Email sent successfully');
    } catch (error) {
      this.logger.error('Failed to send email', error.stack);
    }
  }

  async sendVerificationEmail(to: string, username: string, verificationUrl: string): Promise<void> {
    await this.sendEmail(to, username, verificationUrl, 'verification');
  }

  async sendVerificationForgetPassword(to: string, username: string, verificationUrl: string): Promise<void> {
    await this.sendEmail(to, username, verificationUrl, 'passwordReset');
  }
}
