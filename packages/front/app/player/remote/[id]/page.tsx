"use client";

import React, { use, useEffect, useRef, useState } from "react";
import { showError } from "$shared/utils/errors/showError";
import { assertIsDefined, isDefined } from "$shared/utils/validation";
import { useRouter } from "next/navigation";
import { EpisodeEntity } from "#modules/series/episodes/models";
import { PlayerPlaylistElement, PlayerStatusResponse } from "#modules/remote-player/models";
import { Episode } from "#modules/series/episodes/models";
import { MediaPlayer, RemotePlayerWebSocketsClient } from "#modules/remote-player";
import { EpisodesApi } from "#modules/series/episodes/requests";
import { FetchApi } from "#modules/fetching/fetch-api";
import { logger } from "#modules/core/logger";
import { ContentSpinner } from "#modules/ui-kit/spinner/Spinner";
import styles from "./Player.module.css";

let webSockets: RemotePlayerWebSocketsClient | undefined;
const RESOURCES = [
  "series",
];
const uriToResource: {[key: string]: Episode | null} = {};
let fetchingResource = false;

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};
export default function RemotePlayer( { params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const routerRef = useRef(router);
  // eslint-disable-next-line no-empty-function
  const gotoRemotePlayers = useRef(()=>{} );

  gotoRemotePlayers.current = () => {
    router.push("/player/remote");
  };

  routerRef.current = router;
  const [resource, setResource] = useState<EpisodeEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const setResourceRef = useRef(setResource);
  const previousUriRef = useRef("");

  setResourceRef.current = setResource;
  const intentionalDisconnectOrErrorRef = useRef(false);
  const socketInitializer = () => {
    webSockets = new (class A extends RemotePlayerWebSocketsClient {
      onBackendConnect(): void {
        logger.debug("connected to backend");
        setIsLoading(false);
      }

      onConnectError(): void {
        gotoRemotePlayers.current();
      }

      onDisonnect(): void {
        if (!intentionalDisconnectOrErrorRef.current)
          gotoRemotePlayers.current();
      }

      onStatus(status: PlayerStatusResponse) {
        setStatus(status);

        const uri = status.status?.playlist?.current?.uri;

        if (!uri || uri === previousUriRef.current)
          return;

        if (!fetchingResource) {
          const path = getPathFromUri(uri);

          if (!path)
            return;

          const body: EpisodesApi.GetManyByCriteria.Body = {
            filter: {
              path,
            },
            expand: [
              "series", "fileInfos",
            ],
          };

          fetchingResource = true;
          const episodesApi = FetchApi.get(EpisodesApi);

          episodesApi.getManyByCriteria(body)
            .then((res: EpisodesApi.GetManyByCriteria.Res) => {
              const episodes = res.data;
              const [episode] = episodes;

              try {
                uriToResource[uri] = episode ?? null;
                setResourceRef.current(episode);
              } catch {
                uriToResource[uri] = null;
              }

              fetchingResource = false;
            } )
            .catch(showError)
            .finally(()=>{
              previousUriRef.current = uri;
            } );
        }
      }
    } )();

    webSockets.init( {
      remotePlayerId: id,
    } );

    return () => {
      intentionalDisconnectOrErrorRef.current = true;
      webSockets?.close();
    };
  };

  useEffect(() => socketInitializer(), []);
  const [status, setStatus] = React.useState<PlayerStatusResponse | undefined>(undefined);
  const statusStateRef = useRef( {
    status,
    setStatus,
  } );

  useEffect(()=> {
    statusStateRef.current.setStatus = setStatus;
    statusStateRef.current.status = status;
  }, [status, setStatus]);

  useEffect(()=> {
    if (status && !status.open)
      gotoRemotePlayers.current();
  }, [status]);

  return (
    <>
      <h1>Player</h1>
      { isLoading && <ContentSpinner /> }
      {(isDefined(status?.status) && statusRepresentaton(status.status, resource))}
    </>
  );
}

function getPathFromUri(uri: string) {
  const url = new URL(uri);
  const { pathname } = url;
  const pathNameSplitted = pathname.split("/");
  let indexResourceType = -1;

  for (let i = 0; i < pathNameSplitted.length; i++) {
    if (RESOURCES.includes(pathNameSplitted[i])) {
      indexResourceType = i;
      break;
    }
  }

  if (indexResourceType !== -1) {
    const path = pathNameSplitted.slice(indexResourceType).join("/");

    return path;
  }

  return null;
}

function calcStartLength(statusLength: number, resource: EpisodeEntity | null = null) {
  let resourceEnd: number;
  let resourceStart: number;
  const fileInfo = resource?.fileInfos?.[0];

  resourceEnd = fileInfo?.end ?? statusLength;

  resourceStart = fileInfo?.start ?? 0;

  const length = resourceEnd - resourceStart;

  return {
    start: resourceStart,
    length,
  };
}

function statusRepresentaton(
  status: NonNullable<PlayerStatusResponse["status"]>,
  resource: EpisodeEntity | null = null,
) {
  const uri = status.playlist?.current?.uri;
  let title = "-";

  if (resource)
    title = resource.title;
  else if (status.meta?.title)
    title = status.meta?.title;

  let artist = "-";

  if (resource)
    artist = `${resource.compKey.episodeKey}, ${ resource?.serie?.name}`;
  else
    artist = uri?.slice(uri.lastIndexOf("/") + 1) ?? "-";

  const statusLength = status.length;

  assertIsDefined(statusLength);
  const { start: resourceStart, length } = calcStartLength(statusLength, resource);
  const time = status.time ?? 0 - (resourceStart ?? 0);

  return <>
    {
      webSockets
      && <>
        <MediaPlayer meta={{
          title,
          artist,
        }} time={{
          current: time,
          start: resourceStart,
          length,
        }}
        volume={status.volume}
        state={status.state}
        player={webSockets}/>
      </>
    }
    <div className="extra-margin">
      {
        status.playlist && <>
          <h2>Playlist</h2>
          <h3>Next</h3>
          {
            mapElements(status.playlist.next)
          }
          <h3>Previous</h3>
          {
            mapElements(status.playlist.previous.toReversed())
          }
        </>
      }
    </div>
  </>;
}

function mapElements(array: PlayerPlaylistElement[]): React.JSX.Element {
  return <ol className={styles.list} >
    {
      array.filter(
        (_, i)=>i < 10,
      ).map(
        (item, index) => <li key={index}><a onClick={()=>playId(item.id)}>{item.name}</a></li>,
      )
    }
  </ol>;
}

function playId(id: number) {
  webSockets?.play(id)
    .catch(showError);
}
