"use client";

import MediaPlayer from "#modules/player/MediaPlayer";
import WebSocketsClient from "#modules/player/WebSocketsClient";
import { getBackendUrl } from "#modules/utils";
import { Episode, EpisodeGetManyBySearchRequest, assertIsEpisode } from "#shared/models/episodes";
import { RemotePlayerStatusResponse } from "#shared/models/player";
import PlaylistELement from "#shared/models/player/remote-player/PlaylistElement";
import Loading from "app/loading";
import React, { useEffect } from "react";
import styles from "./Player.module.css";

let webSockets: WebSocketsClient | null = null;
const RESOURCES = [
  "series",
];
const uriToResource: {[key: string]: Episode | null} = {
};
let fetchingResource = false;
let previousUri = "";

export default function Player() {
  const [resource, setResource] = React.useState<Episode | null>(null);
  const socketInitializer = () => {
    webSockets = new (class A extends WebSocketsClient {
      // eslint-disable-next-line class-methods-use-this
      onStatus(status: RemotePlayerStatusResponse) {
        setStatus(status);

        const uri = status.status?.playlist?.current?.uri;

        if (!uri || uri === previousUri)
          return;

        previousUri = uri;

        if (!fetchingResource) {
          const path = getPathFromUri(uri);

          if (!path)
            return;

          const request: EpisodeGetManyBySearchRequest = {
            body: {
              filter: {
                path,
              },
              expand: [
                "series",
              ],
            },
          };
          const bodyStr = JSON.stringify(request.body);

          fetchingResource = true;
          fetch(`${getBackendUrl() }/api/episodes/search`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: bodyStr,
          } ).then(r => r.json())
            .then((episodes: Episode[]) => {
              const episode = episodes[0];

              try {
                assertIsEpisode(episode);

                uriToResource[uri] = episode ?? null;
                setResource(episode);
              } catch {
                uriToResource[uri] = null;
              }

              fetchingResource = false;
            } );
        }
      }
    } )();

    webSockets.init();
  };

  useEffect(() => socketInitializer(), []);
  const [status, setStatus] = React.useState<RemotePlayerStatusResponse | null | undefined>(undefined);

  return (
    <>
      <h1 className="title">
          Player
      </h1>

      {status === undefined && <Loading/>}
      {status === null && "Error"}
      {status && statusRepresentaton(status, resource)}
    </>
  );
}

function getPathFromUri(uri: string) {
  const url = new URL(uri);
  const {pathname} = url;
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

function statusRepresentaton(status: RemotePlayerStatusResponse, resource: Episode | null = null) {
  const uri = status?.status?.playlist?.current?.uri;
  let title = "-";

  if (resource)
    title = resource.title;
  else if (status?.status?.meta?.title)
    title = status?.status?.meta?.title;

  let artist = "-";

  if (resource)
    artist = `${resource.episodeId}, ${ resource?.serie?.name}`;
  else
    artist = uri?.slice(uri.lastIndexOf("/") + 1) ?? "-";

  const time = status?.status?.time ?? 0 - (resource?.start ?? 0);
  let length;
  const statusLength = status?.status?.length;

  if (resource?.end !== undefined && resource?.start !== undefined)
    length = resource.end - resource.start;
  else if (statusLength !== undefined) {
    if (resource?.start !== undefined)
      length = statusLength - resource.start;
  }

  return <>
    Estado: {status.running ? "Abierto" : "Cerrado"}
    <br/>
    {
      status.running &&
      <>
        <MediaPlayer meta={{
          title,
          artist,
        }} time={{
          current: time,
          start: resource?.start ?? 0,
          length,
        }}
        volume={status.status?.volume}
        state={status.status?.state}
        actions={{
          pauseToggle,
          previous,
          next,
          stop,
          seek,
        }}/>
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

function mapElements(array: PlaylistELement[]): React.JSX.Element {
  return <ol className={styles.list} >
    {
      array.filter((_, i)=>i < 10).map((item, index) =>
        <li key={index}><a onClick={()=>playId(item.id)}>{item.name}</a></li>,
      )
    }
  </ol>;
}

function pauseToggle() {
  webSockets?.emitPauseToggle();
}
function next() {
  webSockets?.emitNext();
}
function previous() {
  webSockets?.emitPrevious();
}
function stop() {
  webSockets?.emitStop();
}
function seek(val: number | string) {
  webSockets?.emitSeek(val);
}

function playId(id: number) {
  webSockets?.emitPlay(id);
}