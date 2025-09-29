import { Inject, Injectable, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from "express";
import { assertIsDefined } from "$shared/utils/validation";
import { AppPayload, UserEntityWithRoles, userEntityWithRolesSchema, UserPayload } from "$shared/models/auth";
import { UsersRepository } from "#core/auth/users/crud/repository";

@Injectable( {
  scope: Scope.REQUEST,
} )
export class AppPayloadService {
  private payload: AppPayload;

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly jwtService: JwtService,
    private readonly usersRepo: UsersRepository,
  ) {
    assertIsDefined(this.request);
    this.payload = this.getValidPayloadOrNull() ?? this.generateEmptyPayload();
  }

  currentPayload() {
    return this.payload;
  }

  private setAuthCookie(token: string): void {
    const request = (this.request as Request);
    const response = request.res as Response;
    const { AUTH_COOKIE_NAME } = process.env;

    assertIsDefined(AUTH_COOKIE_NAME);

    response.cookie(AUTH_COOKIE_NAME, token);
  }

  private persist(): void {
    (this.request as any).auth = this.payload;

    const token = this.sign(this.payload);

    this.setAuthCookie(token);
  }

  getUser(): UserPayload | null {
    const { payload } = this;

    if (!payload)
      return null;

    return payload.user;
  }

  async refreshUserAsync() {
    const currentUser = this.getUser();

    if (!currentUser)
      return;

    const updatedUser = await this.usersRepo.getOneById(currentUser.id, {
      expand: ["roles"],
    } ) as UserPayload;

    this.payload.user = updatedUser;
  }

  login(user: UserEntityWithRoles) {
    const parsed = userEntityWithRolesSchema.parse(user);

    this.putUser(parsed);
    this.persist();
  }

  logout() {
    this.removeUser();
    this.persist();
  }

  private putUser(user: UserPayload): void {
    this.payload = {
      ...this.payload,
      user,
    };
  }

  private generateEmptyPayload(): AppPayload {
    return {
      user: null,
    };
  }

  private sign(payload: AppPayload): string {
    const { exp, iat, ...payloadWithoutExp } = payload;
    const token = this.jwtService.sign(payloadWithoutExp);

    return token;
  }

  private removeUser(): void {
    this.payload = {
      ...this.payload,
      user: null,
    };
  }

  private getValidPayloadOrNull() {
    const { request } = this;

    if (!request)
      return null;

    const requestAuth = (request as any).auth;

    if (requestAuth)
      return requestAuth;

    const jwtToken = this.getTokenFromCookie();

    if (!jwtToken)
      return null;

    try {
      this.jwtService.verify(jwtToken);
    } catch {
      return null;
    }
    const json = this.jwtService.decode(jwtToken, {
      json: true,
    } ) as AppPayload;

    return json;
  }

  private getTokenFromCookie(): string | null {
    const { cookies } = this.request;

    if (!cookies)
      return null;

    const { AUTH_COOKIE_NAME } = process.env;

    assertIsDefined(AUTH_COOKIE_NAME);

    return cookies[AUTH_COOKIE_NAME];
  }
}

function domainToBaseUrl(_domain?: string) {
  // TODO
  return "/";
}

export type Query = {[key: string]: string} | undefined;

export function getFullUrlByQuery(query: Query) {
  if (!query)
    return null;

  const redirectPage: string | undefined = query.redirect_page?.toString();

  if (!redirectPage)
    return null;

  const redirectDomain: string | undefined = query.redirect_domain?.toString();

  return `${domainToBaseUrl(redirectDomain)}/${redirectPage}`;
}
