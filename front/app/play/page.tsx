"use client";

import { getBackendUrl } from "#modules/utils";
import { Fragment, MouseEventHandler } from "react";

export default function Play() {
  const playStream: (stream: string)=> MouseEventHandler = (stream: string) => (e) => {
    e.preventDefault();
    fetch(`${getBackendUrl()}/api/play/stream/${stream}`, {
      method: "GET",
    } );
  };

  return (
    <div className="extra-margin">
      <h1 className="title">
          Play
      </h1>

      <h2>Streams</h2>
      {
        ["simpsons", "fguy", "futurama", "rick-morty"].map((stream) => (
          <Fragment key={stream}>
            <a onClick={playStream(stream)}>Play {stream}</a>
            <br/>
            <br/>
          </Fragment>
        ))
      }
    </div>
  );
}
