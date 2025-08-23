"use client";

import { Fragment, MouseEventHandler } from "react";
import { showError } from "$shared/utils/errors/showError";
import { Stream } from "$shared/models/streams";
import { PATH_ROUTES } from "$shared/routing";
import { backendUrl } from "#modules/requests";
import { StreamsFetching } from "#modules/streams/requests";
import { renderFetchedData } from "#modules/fetching";
import { useCrudData } from "#modules/fetching/index";

export function List() {
  const { data, error, isLoading } = useCrudData( {
    refetching: {
      fn: async () => {
        const result = await StreamsFetching.GetMany.fetch( {} );

        return result.data;
      },
    },
  } );

  return renderFetchedData( {
    data,
    error,
    isLoading,
    render: (d) => {
      const playStream: (stream: string)=> MouseEventHandler = (stream: string) => (e) => {
        e.preventDefault();
        fetch(backendUrl(PATH_ROUTES.player.play.stream.withParams(stream)), {
          method: "GET",
        } )
          .catch(showError);
      };

      return <>
        {
          d.map((stream: Stream) => {
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
