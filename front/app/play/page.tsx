/* eslint-disable require-await */

"use client";

import { getBackendUrl } from "#modules/utils";
import { Stream, StreamCriteriaExpand, StreamCriteriaSort, StreamGetManyRequest, assertIsStream, assertIsStreamGetManyResponse } from "#shared/models/streams";
import { CriteriaSortDir } from "#shared/utils/criteria";
import Loading from "app/loading";
import { Fragment, MouseEventHandler, useState } from "react";
import useSWR from "swr";

const bodyJson: StreamGetManyRequest["body"] = {
  "expand": [StreamCriteriaExpand.series],
  sort: {
    [StreamCriteriaSort.lastTimePlayed]: CriteriaSortDir.DESC,
  },
};

export const fetcher = async (url: string) => {
  const options = {
    method: "POST",
    body: JSON.stringify(bodyJson),
    cors: "no-cors",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
  };

  return fetch(url, options).then(r => r.json());
};

export default function Play() {
  return (
    <div className="extra-margin">
      <h1 className="title">
          Play
      </h1>

      <h2>Streams</h2>
      {
        <List />
      }
    </div>
  );
}
function List() {
  const URL = `${getBackendUrl()}/api/streams/criteria`;
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
    fetch(`${getBackendUrl()}/api/play/stream/${stream}`, {
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
