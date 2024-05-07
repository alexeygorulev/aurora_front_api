import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  constructor(private mailerService: MailerService) {}

  async sendVerificationEmail(to: string, username: string, verificationUrl: string): Promise<void> {
    const subject = 'Подтверждение адреса электронной почты';
    const html = `
      <h1>Привет, ${username}!</h1>
      <p>Пожалуйста, подтвердите ваш адрес электронной почты, нажав на ссылку ниже:</p>
      <a href="${verificationUrl}">Подтвердить электронную почту</a>
      <p>Если вы не создавали этот запрос, просто проигнорируйте это письмо.</p>
    `;
    console.log(to);

    try {
      await this.mailerService.sendMail({
        to: to,
        subject: subject,
        html: html,
      });
      console.log('успех');
    } catch (error) {
      this.logger.error('Failed to send email', error.stack);
    }
  }
}
