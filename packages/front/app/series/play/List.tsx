"use client";

// eslint-disable-next-line no-restricted-imports
import { Stream, assertIsStream, assertIsStreamGetManyResponse } from "#shared/models/streams";
import { Fragment, MouseEventHandler, useState } from "react";
import useSWR from "swr";
import { showError } from "#shared/utils/errors/showError";
import { fetcher } from "./fetcher";
import { Loading } from "#modules/loading";
import { seriesBackendUrls } from "#modules/series";
import { rootBackendUrl } from "#modules/requests";

export const backendUrls = {
  stream: `${rootBackendUrl}/api/play/stream`,
};

export function List() {
  const URL = seriesBackendUrls.streams.crud.search;
  const { data, error, isLoading } = useSWR(
    URL,
    fetcher,
  );
  const [streams, setStreams] = useState<Stream[]>(data);

  if (error) {
    return <>
      <p>Failed to load.</p>
      <p>{URL}</p>
      <p>{JSON.stringify(error, null, 2)}</p>
    </>;
  }

  if (!streams && isLoading)
    return <Loading/>;

  if (streams === undefined) {
    assertIsStreamGetManyResponse(data);
    data.forEach((stream: Stream) => {
      assertIsStream(stream);
    } );
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
