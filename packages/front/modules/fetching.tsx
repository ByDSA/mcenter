import Loading from "app/loading";
import React, { JSX } from "react";
import useSWR from "swr";

type MakeFetcherParams<T> = {
  body: Object;
  method: "GET" | "POST";
  validator: (data: T)=> void;
};
export function makeFetcher<T>( {body, method, validator}: MakeFetcherParams<T>) {
  const ret = async (url: string) => {
    const options = {
      method,
      cors: "no-cors",
      body: JSON.stringify(body),
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
    };
    const res = await fetch(url, options);

    if (!res.ok)
      throw new Error("An error occurred while fetching the data.");

    const value = await res.json();

    validator(value);

    return value;
  };

  return ret;
}

type UseRequestResult<T> = {
  data: T | undefined;
  error?: any;
  isLoading: boolean;
  url: string;
};
export type Fetcher = (url: string)=> Promise<any>;
type MakeUseRequestParams = {
  url: string;
  fetcher: Fetcher;
  refreshInterval?: number;
};

export type UseRequest<T> = ()=> UseRequestResult<T>;

export function makeUseRequest<T>( {url, fetcher, refreshInterval}: MakeUseRequestParams): UseRequest<T> {
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

type FetchingRenderParams<T> = {
useRequest: UseRequest<T>;
render: (data: T)=> JSX.Element;
};
export function FetchingRender<T>( {useRequest, render}: FetchingRenderParams<T>): JSX.Element {
  const {data, error, isLoading, url} = useRequest();

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

  return render(data);
}