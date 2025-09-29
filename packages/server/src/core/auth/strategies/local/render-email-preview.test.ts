/* eslint-disable jest/expect-expect */
/* eslint-disable jest/no-disabled-tests */
// @ts-nocheck
import fs from "node:fs";
import { ReactRenderService } from "#core/mails/render.service";
import { WelcomeEmail } from "./WelcomeEmail";
import { VerificationEmail } from "./VerificationEmail";

it.skip("aa", () => {
  const service = new ReactRenderService();
  const html = service.render( {
    template: {
      component: VerificationEmail,
      ctx: {
        appName: "MCenter",
        expiresMinutes: 60,
        supportEmail: "test@gmail.com",
        url: `${process.env.FRONTEND_URL}/auth/verification/token/sdadasdasdasd`,
        appUrl: `${process.env.FRONTEND_URL}/`,
        username: "Person",
      },
    },
  } );

  fs.writeFileSync("preview.html", html);
} );

it.skip("aa2", () => {
  const service = new ReactRenderService();
  const html = service.render( {
    template: {
      component: WelcomeEmail,
      ctx: {
        appName: "MCenter",
        supportEmail: "test@gmail.com",
        url: `${process.env.FRONTEND_URL}/auth/verification/token/sdadasdasdasd`,
        appUrl: `${process.env.FRONTEND_URL}/`,
        username: "Person",
      },
    },
  } );

  fs.writeFileSync("preview.html", html);
} );
