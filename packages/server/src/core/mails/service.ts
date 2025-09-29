import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { ReactRenderService, TemplateProps } from "./render.service";
import { APP_CONFIG, ConfigOdm } from "#core/config";
import { isDev } from "#utils";

type SendProps<T> = {
  subject: string;
  to: string;
  from?: string;
  template: TemplateProps<T>;
};

@Injectable()
export class MailsService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly renderService: ReactRenderService,
  ) {}

  async send<T>(props: SendProps<T>) {
    if (isDev()) {
      const disabled = (await ConfigOdm.Model.findOne())?.mails.disabled;

      if (disabled)
        return;
    }

    const html = this.renderService.render( {
      template: props.template,
    } );

    await this.mailerService.sendMail( {
      to: props.to,
      from: props.from ?? `${APP_CONFIG.AppName} <${process.env.MAILS_SMTP_USER}>`,
      subject: props.subject,
      html,
      encoding: "utf8",
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    } );
  }
}
