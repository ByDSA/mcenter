import { PATH_ROUTES } from "$shared/routing";
import { AuthCrudDtos } from "$shared/models/auth/dto/transport";
import z from "zod";
import { backendUrl } from "#modules/requests";
import { makeFetcher } from "#modules/fetching/fetcher";
import { FetchApi } from "#modules/fetching/fetch-api";
import { logger } from "../logger";
import { HttpErrorUnauthorized } from "../errors/custom-errors";

export class AuthApi {
  static {
    FetchApi.register(this, new this());
  }

  async localLogin(dto: AuthCrudDtos.LocalLogin.Body) {
    const f = makeFetcher( {
      method: "POST",
      requestSchema: AuthCrudDtos.LocalLogin.bodySchema,
      responseSchema: AuthCrudDtos.LocalLogin.responseSchema,
      errorMiddleware: (e)=> {
        if (!(e instanceof HttpErrorUnauthorized))
          logger.error(e);
      },
    } );
    const res = await f( {
      url: backendUrl(PATH_ROUTES.auth.local.login.path),
      body: dto,
    } );

    return res;
  }

  async localSignUp(dto: AuthCrudDtos.LocalSignUp.Body) {
    const f = makeFetcher( {
      method: "POST",
      requestSchema: AuthCrudDtos.LocalSignUp.bodySchema,
      responseSchema: z.undefined(),
      errorMiddleware: (e)=> {
        if (e instanceof Error && e.message.toLowerCase().includes("username already exists")) {
          logger.error("El usuario ya está registrado");

          return;
        }

        if (!(e instanceof HttpErrorUnauthorized))
          logger.error(e);
      },
    } );
    const res = await f( {
      url: backendUrl(PATH_ROUTES.auth.local.signup.path),
      body: dto,
    } );

    return res;
  }
}
