import { Inject, Injectable, Scope } from "@nestjs/common";
import { CookieOptions, Request, Response } from "express";
import { assertIsDefined } from "$shared/utils/validation";
import { AppPayload, UserEntityWithRoles, userEntityWithRolesSchema, UserPayload } from "$shared/models/auth";
import { REQUEST } from "@nestjs/core";
import { UsersRepository } from "#core/auth/users/crud/repository";
import { isProduction } from "#utils";
import { AppPayloadEncoderService } from "./AppPayloadEncoderService";

@Injectable( {
  scope: Scope.REQUEST,
} )
export class AppPayloadService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly encoder: AppPayloadEncoderService,
    private readonly usersRepo: UsersRepository,
  ) {
    assertIsDefined(this.request);
  }

  private setAuthCookie(token: string, opts?: CookieOptions): void {
    const request = (this.request as Request);
    const response = request.res as Response;
    const { AUTH_COOKIE_NAME } = process.env;

    assertIsDefined(AUTH_COOKIE_NAME);

    const options: CookieOptions = {
      httpOnly: true, // Protege contra XSS
      secure: isProduction(), // HTTPS
      sameSite: "lax", // Para que el redirect de google mande la cookie. No protege contra CSRF
      maxAge: 7 * 24 * 60 * 60 * 1_000,
      ...opts,
    };

    response.cookie(AUTH_COOKIE_NAME, token, options);
  }

  private persist(payload: AppPayload, opts?: CookieOptions): void {
    (this.request as any).auth = payload;
    const token = this.encoder.sign(payload, {
      expiresIn: "7d",
    } );

    this.setAuthCookie(token, opts);
  }

  getCookieUser(): UserPayload | null {
    assertIsDefined(this.request);
    const payload = (this.request as any).auth;

    return payload?.user ?? null;
  }

  async refreshUser(user: UserPayload) {
    const updatedUser = await this.usersRepo.getOneById(user.id, {
      expand: ["roles"],
    } ) as UserPayload;

    this.putUser(updatedUser);

    this.persist((this.request as any).auth);

    return updatedUser;
  }

  login(user: UserEntityWithRoles) {
    const parsed = userEntityWithRolesSchema.parse(user);

    this.putUser(parsed);
    this.persist((this.request as any).auth);
  }

  logout() {
    (this.request as any).auth = {
      ...(this.request as any).auth,
      user: null,
    };
    this.persist((this.request as any).auth);
  }

  private putUser(user: UserPayload): void {
    (this.request as any).auth = {
      ...(this.request as any).auth,
      user,
    };
  }
}
