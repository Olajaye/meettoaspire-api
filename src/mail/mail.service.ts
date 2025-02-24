import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { firstValueFrom } from 'rxjs';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import Utils from '../helper/utils';
import Config from '../helper/config';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class MailService {
  private readonly brevoBaseUrl = process.env.BREVO_BASE_URL;
  private readonly brevoApiKey = process.env.BREVO_API_KEY;
  // private readonly brevoNewsletterList = process.env.BREVO_NEWSLETTER_LIST;
  constructor(private readonly mailerService: MailerService,
    private readonly httpService: HttpService
  ) {}

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


  async sendMaill(
    email: string | string[],
    subject: string,
    payload: any,
    template: string,
  ) {
    // Read the email template
    const emailTemplateSource = fs.readFileSync(
      path.join(__dirname, `/templates/${template}`),
      'utf8',
    );

    // Prepare the email payload
    const mailPayload = {
      greeting: 'Dear User',
      customerAppUrl: 'https://' + Config.app.customerAppDomain(),
    };
    Object.assign(mailPayload, payload);

    // Compile the Handlebars template
    const compiledTemplate = handlebars.compile(emailTemplateSource);

    // Prepare the email data for Brevo API
    const emailData = {
      sender: {
        name: 'Jaye',
        email: 'jayeolajeremiah@gmail.com',
      },
      to: Array.isArray(email)
        ? email.map((e) => ({ email: e }))
        : [{ email: email }],
      subject: subject,
      htmlContent: compiledTemplate(mailPayload),
    };

    try {
      // Send the email using Brevo API
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.brevoBaseUrl}/smtp/email`,
          emailData,
          {
            headers: {
              'api-key': this.brevoApiKey,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      console.log('Email sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending email:', error.response?.data || error.message);
    }
  }
}
