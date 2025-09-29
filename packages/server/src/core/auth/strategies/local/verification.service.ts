import { randomBytes } from "node:crypto";
import { HttpException, HttpExceptionOptions, HttpStatus, Injectable } from "@nestjs/common";
import { PATH_ROUTES } from "$shared/routing";
import { User } from "$shared/models/auth";
import { OnEvent } from "@nestjs/event-emitter";
import { assertIsDefined } from "$shared/utils/validation";
import { APP_CONFIG } from "#core/config";
import { MailsService } from "#core/mails/service";
import { UserEvents } from "#core/auth/users/crud/repository/events";
import { UsersRepository } from "#core/auth/users/crud/repository";
import { assertFoundServer } from "#utils/validation/found";
import { UserPassEntity } from "./user-pass/userPass.entity";
import { UserPassesRepository } from "./user-pass";
import { VerificationEmail } from "./VerificationEmail";
import { WelcomeEmail } from "./WelcomeEmail";
import { UserPassEvents } from "./user-pass/repository/events";
import { UserPass } from "./user-pass/userPass.entity";

type SendVerificationMailUserPass = Pick<UserPassEntity, "id" | "lastVerificationEmailSentAt" |
  "username" | "verificationEmailCount">;
type SendVerificationMailProps = {
  userPass: SendVerificationMailUserPass;
  publicName: string;
  mail: string;
};

@Injectable()
export class LocalUserVerificationService {
  constructor(
    private readonly mailsService: MailsService,
    private readonly usersRepo: UsersRepository,
    private readonly userPassesRepo: UserPassesRepository,
  ) {
  }

  @OnEvent(UserPassEvents.Created.TYPE)
  async handleCreateNewUserPassEvents(ev: UserPassEvents.Created.Event) {
    const userPass = ev.payload.entity;
    const { userId } = userPass;
    const user = await this.usersRepo.getOneById(userId);

    assertFoundServer(user);

    await this.sendVerificationMail( {
      mail: user.email,
      publicName: user.publicName ?? userPass.username,
      userPass,
    } );
  }

  @OnEvent(UserPassEvents.Patched.TYPE)
  async handlePatchUserPassEvents(ev: UserPassEvents.Patched.Event) {
    const { key, value } = ev.payload;

    if ((key as keyof Partial<UserPass>) === "verificationToken" && value === undefined) {
      const userPass = await this.userPassesRepo.getOneById(ev.payload.entityId);

      assertIsDefined(userPass);
      const user = await this.usersRepo.getOneById(userPass.userId);

      assertIsDefined(user);
      await this.sendWelcomeEmail(user);
    }
  }

  @OnEvent(UserEvents.Created.TYPE)
  async handleCreateNewUserEvents(ev: UserEvents.Created.Event) {
    if (ev.payload.entity.emailVerified)
      await this.sendWelcomeEmail(ev.payload.entity);
  }

  async sendVerificationMail( { mail, publicName, userPass }: SendVerificationMailProps) {
    this.guardSendVerificationMail(userPass);
    const token = this.generateVerificationToken();
    const url = `\
${process.env.FRONTEND_URL}${PATH_ROUTES.auth.frontend.emailVerification.verify.withParams(token)}\
`;

    await this.mailsService.send( {
      template: {
        component: VerificationEmail,
        ctx: {
          appName: APP_CONFIG.AppName,
          expiresMinutes: Math.round(APP_CONFIG.EmailVerification.TokenExpirationTime / 60),
          supportEmail: APP_CONFIG.SupportEmail,
          url,
          appUrl: `${process.env.FRONTEND_URL}/`,
          username: publicName,
        },
      },
      subject: "Verificate your account",
      to: mail,
    } );

    await this.userPassesRepo.patchOneByIdAndGet(userPass.id, {
      entity: {
        verificationToken: token,
        verificationEmailCount: (userPass.verificationEmailCount ?? 0) + 1,
        lastVerificationEmailSentAt: new Date(),
        verificationTokenExpiresAt: new Date(
          Date.now() + (APP_CONFIG.EmailVerification.TokenExpirationTime * 1000),
        ),
      },
    } );
  }

  async sendWelcomeEmail(user: User) {
    await this.mailsService.send( {
      template: {
        component: WelcomeEmail,
        ctx: {
          appName: APP_CONFIG.AppName,
          supportEmail: APP_CONFIG.SupportEmail,
          appUrl: `${process.env.FRONTEND_URL}/`,
          username: user.publicName,
        },
      },
      subject: `Welcome to ${APP_CONFIG.AppName}!`,
      to: user.email,
    } );
  }

  private guardSendVerificationMail(userPass: SendVerificationMailUserPass) {
    if (userPass.lastVerificationEmailSentAt
      && new Date() < new Date(
        userPass.lastVerificationEmailSentAt.getTime()
          + (APP_CONFIG.EmailVerification.MinMailInterval * 1000),
      ))
      throw new TooManyRequestsException("Last verification email near in time");

    if ((userPass.verificationEmailCount ?? 0) >= APP_CONFIG.EmailVerification.MaxCount)
      throw new TooManyRequestsException("Exceeded verification email count");

    // TODO: resetear counters 1-2 veces al día
  }

  private generateVerificationToken(): string {
    return randomBytes(32).toString("hex"); // Genera un token de 64 caracteres hexadecimales
  }
}

export class TooManyRequestsException extends HttpException {
  constructor(response: Record<string, any> | string, options?: HttpExceptionOptions) {
    super(response, HttpStatus.TOO_MANY_REQUESTS, options);
  }
}
