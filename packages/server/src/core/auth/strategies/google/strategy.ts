/* eslint-disable require-await */
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { Request } from "express";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor() {
    super( {
      clientID: process.env.AUTH_GOOGLE_CLIENT_ID ?? "dummy",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "dummy",
      callbackURL: process.env.AUTH_GOOGLE_CALLBACK_URL ?? "dummy",
      scope: ["email", "profile"],
    } );
  }

  async validate(
    accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
    };

    done(null, user);
  }

  async authenticate(req: Request, options?: object) {
    if (req.query.state) {
      return super.authenticate(req, {
        ...options,
        state: req.query.state,
      } );
    }

    return super.authenticate(req, options);
  }
}
