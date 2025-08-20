"use client";

import { Fragment, MouseEventHandler } from "react";
import { showError } from "$shared/utils/errors/showError";
import { Stream } from "$shared/models/streams";
import { PATH_ROUTES } from "$shared/routing";
import { backendUrl } from "#modules/requests";
import { FetchingRender } from "#modules/fetching";
import { StreamsFetching } from "#modules/streams/requests";

export function List() {
  return FetchingRender( {
    useRequest: StreamsFetching.GetMany.useRequest,
    render: (res) => {
      const playStream: (stream: string)=> MouseEventHandler = (stream: string) => (e) => {
        e.preventDefault();
        fetch(backendUrl(PATH_ROUTES.player.play.stream.withParams(stream)), {
          method: "GET",
        } )
          .catch(showError);
      };
      const streams = res.data;

      return <>
        {
          streams.data && streams.data.map((stream: Stream) => {
            const name = (stream.group.origins[0].type === "serie"
              ? stream.group.origins[0]?.serie?.name
              : undefined)
          ?? stream.key;

            return (
              <Fragment key={stream.key}>
                <a onClick={playStream(stream.key)}>Play {name} ({stream.key}, {stream.mode})</a>
                <br/>
                <br/>
              </Fragment>
            );
          } )
        }
      </>;
    },
  } );
}
