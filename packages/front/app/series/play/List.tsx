"use client";

import { Fragment, MouseEventHandler } from "react";
import { Stream } from "$shared/models/streams";
import { PATH_ROUTES } from "$shared/routing";
import { RemotePlayerDtos } from "$shared/models/player/remote-player/dto/domain";
import { useRouter } from "next/navigation";
import { backendUrl } from "#modules/requests";
import { StreamsFetching } from "#modules/episodes/streams/requests";
import { renderFetchedData } from "#modules/fetching";
import { useCrudData } from "#modules/fetching/index";
import { logger } from "#modules/core/logger";

export function List() {
  const router = useRouter();
  const { data, error, isLoading } = useCrudData( {
    refetching: {
      fn: async () => {
        const result = await StreamsFetching.GetMany.fetch( {} );

        return result.data;
      },
      everyMs: 10_000,
    },
  } );

  return renderFetchedData( {
    data,
    error,
    loader: {
      isLoading,
    },
    render: (d) => {
      const playStream: (
        stream: string
      )=> MouseEventHandler = (stream: string) => async (e) => {
        e.preventDefault();

        const remotePlayersRes = await fetch(backendUrl("/api/player/remote-players"), {
          credentials: "include",
        } );
        const remotePlayers: RemotePlayerDtos.Front.Dto[] = await remotePlayersRes.json();
        const onlineRemotePlayers = remotePlayers.filter(r=>r.status !== "offline");

        if (onlineRemotePlayers.length === 0)
          logger.error("No hay remote players disponibles");

        if (onlineRemotePlayers.length > 1)
          logger.error("Hay más de un remote player disponible");

        const remotePlayer = onlineRemotePlayers[0];

        await fetch(backendUrl(PATH_ROUTES.player.play.stream.withParams(
          remotePlayer.id,
          stream,
        )), {
          method: "GET",
          credentials: "include",
        } );

        await router.push("/player/remote/" + remotePlayer.id);
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
