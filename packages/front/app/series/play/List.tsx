"use client";

import { Fragment, MouseEventHandler, useState } from "react";
import useSWR from "swr";
import { showError } from "$shared/utils/errors/showError";
import { Stream, streamSchema } from "$shared/models/streams";
import { PATH_ROUTES } from "$shared/routing";
import { assertIsManyDataResponse, DataResponse } from "$shared/utils/http/responses";
import { Loading } from "#modules/loading";
import { backendUrl } from "#modules/requests";
import { fetcher } from "./fetcher";

export const backendUrls = {
  stream: backendUrl(PATH_ROUTES.player.play.stream.path),
};

export function List() {
  const URL = backendUrl(PATH_ROUTES.streams.search.path);
  const { data: res, error, isLoading } = useSWR<DataResponse<Stream[]>>(
    URL,
    fetcher,
  );
  const [streams, setStreams] = useState<Stream[] | undefined>(res?.data);

  if (error || (res?.errors && res?.errors.length > 0)) {
    return <>
      <p>Failed to load.</p>
      <p>{URL}</p>
      <p>{JSON.stringify(error, null, 2)}</p>
    </>;
  }

  if (!streams && isLoading)
    return <Loading/>;

  if (streams === undefined && res) {
    assertIsManyDataResponse(res, streamSchema);
    const { data } = res;

    setStreams(data);
  }

  const playStream: (stream: string)=> MouseEventHandler = (stream: string) => (e) => {
    e.preventDefault();
    fetch(`${backendUrls.stream}/${stream}`, {
      method: "GET",
    } )
      .catch(showError);
  };

  return <>
    {
      streams && streams.map((stream: Stream) => {
        let name;

        if ("serie" in stream.group.origins[0])
          name = stream.group.origins[0].serie?.name;

        if (!name)
          name = stream.id;

        return (
          <Fragment key={stream.id}>
            <a onClick={playStream(stream.id)}>Play {name} ({stream.id}, {stream.mode})</a>
            <br/>
            <br/>
          </Fragment>
        );
      } )
    }
  </>;
}
