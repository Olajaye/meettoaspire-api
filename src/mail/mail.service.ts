import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import Utils from '../helper/utils';
import Config from '../helper/config';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(
    email: string | string[],
    subject: string,
    payload: any,
    template: string,
  ) {
    const emailTemplateSource = fs.readFileSync(
      path.join(__dirname, `/templates/${template}`),
      'utf8',
    );
    const mailPayload = {
      greeting: 'Dear User',
      customerAppUrl: 'https://' + Config.app.customerAppDomain(),
    };
    Object.assign(mailPayload, payload);
    const compiledTemplate = handlebars.compile(emailTemplateSource);
    const mailOptions = {
      to: email,
      subject: subject,
      html: compiledTemplate(mailPayload),
    };

    try {
      await this.mailerService.sendMail({
        ...mailOptions,
        from:
          '"No Reply" <' +
          Utils.env('MAIL_FROM_ADDRESS', 'noreply@meettoaspire.com') +
          '>',
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
