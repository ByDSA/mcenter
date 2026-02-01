import { ZodType } from "zod";
import { genAssertZod, genParseZod } from "$shared/utils/validation/zod";
import { assertIsDefined } from "$shared/utils/validation";
import { HttpError, HttpErrorUnauthorized } from "#modules/core/errors/custom-errors";
import { logger } from "#modules/core/logger";

type OptionalIfUndefined<T, K extends string> = undefined extends T
  ? { [P in K]?: T }
  : { [P in K]: T };

type Method = "DELETE" | "GET" | "PATCH" | "POST";
type FetcherParams<ReqBody> = OptionalIfUndefined<ReqBody, "body"> & {
  url: string;
};
export type Fetcher<ReqBody, ResBody> = (params: FetcherParams<ReqBody>)=> Promise<ResBody>;

type MakeFetcherParams<ReqBody, ResBody> = {
  method: Method;
  reqBodyValidator?: (data: ReqBody)=> void;
  requestSchema?: ZodType<ReqBody, any, any>;
  parseResponse?: (data: unknown)=> ResBody;
  responseSchema?: ZodType<ResBody, any, any>;
  errorMiddleware?: (error: any)=> void;
  silentErrors?: boolean;
};
export function makeFetcher<ReqBody = undefined, ResBody = unknown>(
  { method,
    parseResponse,
    responseSchema,
    reqBodyValidator,
    requestSchema,
    silentErrors = false,
    errorMiddleware = (err)=> {
      if (err instanceof HttpErrorUnauthorized) {
        if (!silentErrors)
          logger.error("No estás autorizado a realizar esta acción.");

        return;
      }

      if (err instanceof Error && err.message.includes("Failed to fetch"))
        return;

      if (!silentErrors)
        logger.error(err);
    } }: MakeFetcherParams<ReqBody, ResBody>,
): Fetcher<ReqBody, ResBody> {
  const ret = async (params: FetcherParams<ReqBody>) => {
    let innerReqBodyValidator = reqBodyValidator;

    if (!innerReqBodyValidator && requestSchema)
      innerReqBodyValidator = genAssertZod(requestSchema);

    innerReqBodyValidator?.(params.body!);

    const options: RequestInit = {
      method,
      credentials: "include", // Para que devuelva la cookie de auth
      headers: {
        accept: "application/json",
      },
    };

    if (params.body) {
      options.body = JSON.stringify(params.body);

      options.headers!["Content-Type"] = "application/json";
    }

    try {
      const res = await fetch(params.url, options);
      const text = await res.text();
      let json;

      if (!res.ok) {
        try {
          const clearedText = text
            .replaceAll("\\\\", "\\");

          json = JSON.parse(clearedText);

          if (json.message && typeof json.message === "string"
        && json.message.startsWith("{"))
            json.message = JSON.parse(json.message);
        } catch {
          throw new Error(text);
        }

        const msg = JSON.stringify(json, null, 2);

        if (res.status === 401)
          throw new HttpErrorUnauthorized(msg);

        throw new HttpError(res.status, msg);
      }

      const value = text ? JSON.parse(text) : undefined;
      let innerParseResponse = parseResponse;

      if (!innerParseResponse) {
        assertIsDefined(responseSchema);
        innerParseResponse = genParseZod(responseSchema);
      }

      return innerParseResponse(value);
    } catch (error) {
      errorMiddleware(error);

      throw error;
    }
  };

  return ret;
}
