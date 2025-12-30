import { PATH_ROUTES } from "$shared/routing";
import { LocalLoginBody, localLoginBodySchema, localLoginResponseSchema, LocalSignUpBody, localSignUpBodySchema } from "$shared/models/auth/dto";
import { genAssertZod, genParseZod } from "$shared/utils/validation/zod";
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

  async localLogin(dto: LocalLoginBody) {
    const f = makeFetcher( {
      method: "POST",
      reqBodyValidator: genAssertZod(localLoginBodySchema),
      parseResponse: genParseZod(localLoginResponseSchema),
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

  async localSignUp(dto: LocalSignUpBody) {
    const f = makeFetcher( {
      method: "POST",
      reqBodyValidator: genAssertZod(localSignUpBodySchema),
      parseResponse: genParseZod(z.undefined()),
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
