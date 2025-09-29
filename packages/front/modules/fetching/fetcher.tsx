import { HttpError, HttpErrorUnauthorized } from "#modules/core/auth/requests";
import { logger } from "#modules/core/logger";

type Method = "DELETE" | "GET" | "PATCH" | "POST";
type FetcherParams<ReqBody> = {
  url: string;
  body: ReqBody;
};
export type Fetcher<ReqBody, ResBody> = (params: FetcherParams<ReqBody>)=> Promise<ResBody>;

type MakeFetcherParams<ReqBody, ResBody> = {
  method: Method;
  reqBodyValidator?: (data: ReqBody)=> void;
  parseResponse: (data: unknown)=> ResBody;
  errorMiddleware?: (error: any)=> void;
};
export function makeFetcher<ReqBody, ResBody>(
  { method,
    parseResponse,
    reqBodyValidator,
    errorMiddleware = (err)=> {
      logger.error(err);
    } }: MakeFetcherParams<ReqBody, ResBody>,
): Fetcher<ReqBody, ResBody> {
  const ret = async (params: FetcherParams<ReqBody>) => {
    reqBodyValidator?.(params.body);

    const options: RequestInit = {
      method,
      credentials: "include", // Para que devuelva la cookie de auth
      body: JSON.stringify(params.body),
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
    };

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

      return parseResponse(value);
    } catch (error) {
      errorMiddleware(error);

      throw error;
    }
  };

  return ret;
}
