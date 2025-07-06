import React, { JSX } from "react";
import useSWR from "swr";
import style from "./fetching.style.module.css";
import { Spinner } from "./ui-kit/spinner";

type Method = "DELETE" | "GET" | "PATCH" | "POST";
type FetcherParams<ReqBody> = {
  url: string;
  method: Method;
  body: ReqBody;
};
export type Fetcher<ReqBody, ResBody> = (params: FetcherParams<ReqBody>)=> Promise<ResBody>;

type MakeFetcherParams<ReqBody, ResBody> = {
  body: ReqBody;
  method: Method;
  reqBodyValidator?: (data: ReqBody)=> void;
  resBodyValidator: (data: ResBody)=> void;
  errorMiddleware?: (error: any)=> void;
};
export function makeFetcher<ReqBody, ResBody>(
  { body,
    method,
    resBodyValidator,
    reqBodyValidator,
    errorMiddleware = console.error }: MakeFetcherParams<ReqBody, ResBody>,
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

      if (!res.ok)
        throw new Error(text);

      const value = text ? JSON.parse(text) : undefined;

      resBodyValidator(value);

      return value;
    } catch (error) {
      errorMiddleware(error);

      throw error;
    }
  };

  return ret;
}

type UseRequestResult<T> = {
  data: T | undefined;
  error?: any;
  isLoading: boolean;
};
type MakeUseRequestParams<ReqBody, ResBody> = {
  key: FetcherParams<ReqBody>;
  fetcher: Fetcher<ReqBody, ResBody>;
  refreshInterval?: number;
};

export type UseRequest<T> = ()=> UseRequestResult<T>;

export function makeUseRequest<R, T>(
  { key, fetcher, refreshInterval }: MakeUseRequestParams<R, T>,
): UseRequest<T> {
  const ret: UseRequest<T> = () => {
    const [data, setData] = React.useState<T | undefined>(undefined);
    const { error, isLoading } = useSWR(
      key,
      fetcher,
      {
        refreshInterval,
        dedupingInterval: 0,
        onSuccess: (d: T) => {
          setData(d);
        },
      },
    );

    return {
      data,
      error,
      isLoading,
    };
  };

  return ret;
}

type FetchingRenderParams<T, U> = {
useRequest: UseRequest<T>;
render: (data: T, hooksRet: U)=> JSX.Element;
hooks?: (data: T | undefined)=> void;
};
export function FetchingRender<T, U = undefined>(
  { useRequest, render, hooks }: FetchingRenderParams<T, U>,
): JSX.Element {
  const { data, error, isLoading } = useRequest();
  const hooksRet = hooks?.(data) as U;

  if (error) {
    const errorShown = {
      message: error instanceof Error ? error.message : undefined,
    };

    return <>
      <p>Failed to request.</p>
      {error && <p>{JSON.stringify(errorShown, null, 2)}</p>}
    </>;
  }

  if (isLoading)
    return <span className={style.loading}><Spinner /></span>;

  if (!data)
    return <span>Empty data.</span>;

  return render(data, hooksRet);
}
