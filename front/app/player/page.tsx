"use client";

import MediaPlayer from "#modules/player/MediaPlayer";
import WebSocketsClient from "#modules/player/WebSocketsClient";
import { RemotePlayerStatusResponse } from "#shared/models/player";
import PlaylistELement from "#shared/models/player/remote-player/PlaylistElement";
import Loading from "app/loading";
import React, { useEffect } from "react";
import styles from "./Player.module.css";

let webSockets: WebSocketsClient | null = null;

export default function Player() {
  const socketInitializer = () => {
    webSockets = new (class A extends WebSocketsClient {
      // eslint-disable-next-line class-methods-use-this
      onStatus(status: RemotePlayerStatusResponse) {
        setStatus(status);
      }
    } )();

    webSockets.init();
  };

  useEffect(() => socketInitializer(), []);
  const [status, setStatus] = React.useState<RemotePlayerStatusResponse | null | undefined>(undefined);

  return (
    <div className="extra-margin">
      <h1 className="title">
          Player
      </h1>

      {status === undefined && <Loading/>}
      {status === null && "Error"}
      {status && statusRepresentaton(status)}
    </div>
  );
}

function statusRepresentaton(status: RemotePlayerStatusResponse) {
  const uri = status?.status?.playlist?.current?.uri;

  return <>
    Estado: {status.running ? "Abierto" : "Cerrado"}
    <br/>
    {
      status.running &&
      <>
        <MediaPlayer meta={{
          title: status?.status?.meta?.title,
          artist: uri,
        }} time={{
          current: status?.status?.time,
          length: status.status?.length,
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