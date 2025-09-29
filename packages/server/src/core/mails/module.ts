import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { MailsService } from "./service";
import { ReactRenderService } from "./render.service";

const ENVS = process.env;

@Module( {
  imports: [
    MailerModule.forRoot( {
      transport: {
        pool: true,
        host: ENVS.MAILS_SMTP_HOST,
        port: 465,
        secure: true, // use TLS
        auth: {
          user: ENVS.MAILS_SMTP_USER,
          pass: ENVS.MAILS_SMTP_PASSWORD,
        },
      },
    } ),
  ],
  providers: [MailsService, ReactRenderService],
  exports: [MailsService],
} )
export class MailsModule { }
