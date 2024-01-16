import Loading from "app/loading";
import React, { JSX } from "react";
import useSWR from "swr";

export type Fetcher<ResBody> = (url: string)=> Promise<ResBody>;

type MakeFetcherParams<ReqBody, ResBody> = {
  body: ReqBody;
  method: "DELETE" | "GET" | "PATCH" | "POST";
  reqBodyValidator?: (data: ReqBody)=> void;
  resBodyValidator: (data: ResBody)=> void;
  errorHandler?: (error: any)=> void;
};
export function makeFetcher<ReqBody, ResBody>( {body, method, resBodyValidator, reqBodyValidator, errorHandler = console.error}: MakeFetcherParams<ReqBody, ResBody>): Fetcher<ResBody> {
  const ret = async (url: string) => {
    reqBodyValidator?.(body);

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
      const res = await fetch(url, options);

      if (!res.ok)
        throw new Error("An error occurred while fetching the data.");

      const value: ResBody = await res.json();

      resBodyValidator(value);

      return value;
    } catch (error) {
      errorHandler(error);

      return null;
    }
  };

  return ret;
}

type UseRequestResult<T> = {
  data: T | undefined;
  error?: any;
  isLoading: boolean;
  url: string;
};
type MakeUseRequestParams<ResBody> = {
  url: string;
  fetcher: Fetcher<ResBody>;
  refreshInterval?: number;
};

export type UseRequest<T> = ()=> UseRequestResult<T>;

export function makeUseRequest<T>( {url, fetcher, refreshInterval}: MakeUseRequestParams<T>): UseRequest<T> {
  const ret: UseRequest<T> = () => {
    const [data, setData] = React.useState<T | undefined>(undefined);
    const { error, isLoading } = useSWR(
      url,
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
      url,
    };
  };

  return ret;
}

type FetchingRenderParams<T, U> = {
useRequest: UseRequest<T>;
render: (data: T, hooksRet: U)=> JSX.Element;
hooks?: (data: T | undefined)=> void;
};
export function FetchingRender<T, U = undefined>( {useRequest, render, hooks}: FetchingRenderParams<T, U>): JSX.Element {
  const {data, error, isLoading, url} = useRequest();
  const hooksRet = hooks?.(data) as U;

  if (error) {
    const errorShown = {
      message: error instanceof Error ? error.message : undefined,
    };

    return <>
      <p>Failed to request.</p>
      <p>URL: <a href={url}>{url}</a></p>
      {error && <p>{JSON.stringify(errorShown, null, 2)}</p>}
    </>;
  }

  if (isLoading || !data)
    return <Loading/>;

  return render(data, hooksRet);
}