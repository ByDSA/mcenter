"use client";

import React, { useEffect } from "react";
import { showError } from "$shared/utils/errors/showError";
import { EpisodeEntity } from "#modules/series/episodes/models";
import { PlayerPlaylistElement, PlayerStatusResponse } from "#modules/remote-player/models";
import { Episode } from "#modules/series/episodes/models";
import { Loading } from "#modules/loading";
import { MediaPlayer, RemotePlayerWebSocketsClient } from "#modules/remote-player";
import { EpisodeFetching } from "#modules/series/episodes/requests";
import styles from "./Player.module.css";

let webSockets: RemotePlayerWebSocketsClient | undefined;
const RESOURCES = [
  "series",
];
const uriToResource: {[key: string]: Episode | null} = {};
let fetchingResource = false;
let previousUri = "";

export default function Player() {
  const [resource, setResource] = React.useState<EpisodeEntity | null>(null);
  const socketInitializer = () => {
    webSockets = new (class A extends RemotePlayerWebSocketsClient {
      onStatus(status: PlayerStatusResponse) {
        setStatus(status);

        const uri = status.status?.playlist?.current?.uri;

        if (!uri || uri === previousUri)
          return;

        previousUri = uri;

        if (!fetchingResource) {
          const path = getPathFromUri(uri);

          if (!path)
            return;

          const body: EpisodeFetching.GetManyByCriteria.Body = {
            filter: {
              path,
            },
            expand: [
              "series", "fileInfos",
            ],
          };

          fetchingResource = true;
          EpisodeFetching.GetManyByCriteria.fetch(body)
            .then((res: EpisodeFetching.GetManyByCriteria.Res) => {
              const episodes = res.data;
              const [episode] = episodes;

              try {
                uriToResource[uri] = episode ?? null;
                setResource(episode);
              } catch {
                uriToResource[uri] = null;
              }

              fetchingResource = false;
            } )
            .catch(showError);
        }
      }
    } )();

    webSockets.init();
  };

  useEffect(() => socketInitializer(), []);
  const [status, setStatus] = React.useState<PlayerStatusResponse | null | undefined>(undefined);

  return (
    <>
      <h1>Player</h1>

      {status === undefined && <Loading/>}
      {status === null && "Error"}
      {status && statusRepresentaton(status, resource)}
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

function calcStartLength(statusLength: number | undefined, resource: EpisodeEntity | null = null) {
  let resourceEnd;
  let resourceStart;
  const fileInfo = resource?.fileInfos?.[0];

  if (
    typeof fileInfo?.end !== "number" || fileInfo.end < 0 || (fileInfo.start !== undefined
    && fileInfo.end < fileInfo.start
    )
  )
    resourceEnd = statusLength;
  else
    resourceEnd = fileInfo.end;

  if (
    typeof fileInfo?.start !== "number" || fileInfo?.start < 0
    || (fileInfo.end !== undefined && fileInfo.start > fileInfo.end
    )
  )
    resourceStart = 0;
  else
    resourceStart = fileInfo.start;

  const length = resourceEnd - resourceStart;

  return {
    start: resourceStart,
    length,
  };
}

function statusRepresentaton(status: PlayerStatusResponse, resource: EpisodeEntity | null = null) {
  const uri = status?.status?.playlist?.current?.uri;
  let title = "-";

  if (resource)

    title = resource.title;
  else if (status?.status?.meta?.title)
    title = status?.status?.meta?.title;

  let artist = "-";

  if (resource)
    artist = `${resource.compKey.episodeKey}, ${ resource?.serie?.name}`;
  else
    artist = uri?.slice(uri.lastIndexOf("/") + 1) ?? "-";

  const statusLength = status?.status?.length;
  const { start: resourceStart, length } = calcStartLength(statusLength, resource);
  const time = status?.status?.time ?? 0 - (resourceStart ?? 0);

  return <>
    Proceso: {status.open ? "Abierto" : "Cerrado"}
    <br/>
    Conexión HTTP: {status.status ? "Sí" : "No"}
    <br/>
    {
      status.open && status.status && webSockets
      && <>
        <MediaPlayer meta={{
          title,
          artist,
        }} time={{
          current: time,
          start: resourceStart,
          length,
        }}
        volume={status.status?.volume}
        state={status.status?.state}
        player={webSockets}/>
      </>
    }
    <div className="extra-margin">
      {
        status.status?.playlist && <>
          <h2>Playlist</h2>
          <h3>Next</h3>
          {
            mapElements(status.status.playlist.next)
          }
          <h3>Previous</h3>
          {
            mapElements(status.status.playlist.previous.toReversed())
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
