"use client";

import { BACKEND_URLS } from "#modules/urls";
import { Stream, assertIsStream, assertIsStreamGetManyResponse } from "#shared/models/streams";
import Loading from "app/loading";
import { Fragment, MouseEventHandler, useState } from "react";
import useSWR from "swr";
import fetcher from "./fetcher";

export default function List() {
  const URL = BACKEND_URLS.resources.streams.crud.search;
  const { data, error, isLoading } = useSWR(
    URL,
    fetcher,
  );
  const [streams, setStreams] = useState<Stream[]>(data);

  if (error)
  {return <>
    <p>Failed to load.</p>
    <p>{URL}</p>
    <p>{JSON.stringify(error, null, 2)}</p>
  </>;}

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
    fetch(`${BACKEND_URLS.play.stream}/${stream}`, {
      method: "GET",
    } );
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
      },
      )
    }
  </>;
}