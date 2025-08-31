type Method = "DELETE" | "GET" | "PATCH" | "POST";
type FetcherParams<ReqBody> = {
  url: string;
  body: ReqBody;
};
export type Fetcher<ReqBody, ResBody> = (params: FetcherParams<ReqBody>)=> Promise<ResBody>;

type MakeFetcherParams<ReqBody, ResBody> = {
  body: ReqBody;
  method: Method;
  reqBodyValidator?: (data: ReqBody)=> void;
  parseResponse: (data: unknown)=> ResBody;
  errorMiddleware?: (error: any)=> void;
};
export function makeFetcher<ReqBody, ResBody>(
  { body,
    method,
    parseResponse,
    reqBodyValidator,
    errorMiddleware = (err)=> {
      console.error(err);

      if (err instanceof Error)
        alert(JSON.stringify(err.message, null, 2));
    } }: MakeFetcherParams<ReqBody, ResBody>,
): Fetcher<ReqBody, ResBody> {
  const ret = async (params: FetcherParams<ReqBody>) => {
    reqBodyValidator?.(params.body);

    const options = {
      method,
      cors: "no-cors",
      body: JSON.stringify(body),
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

        throw new Error(JSON.stringify(json, null, 2));
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
