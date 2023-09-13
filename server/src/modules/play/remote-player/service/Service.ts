/* eslint-disable no-use-before-define */
import { VLCProcess } from "#modules/play/player";
import { VLCWebInterface } from "#modules/play/remote-player/web-interface";
import { assertIsRemotePlayerStatusResponse, RemotePlayerPlaylistElement, RemotePlayerStatusResponse } from "#shared/models/player";
import { assertIsDefined } from "#shared/utils/validation";
import { ServiceUnavailableError } from "#utils/http/validation";
import { decode } from "html-entities";
import PlaylistResponse, { PlaylistELement } from "../web-interface/PlaylistResponse";
import StatusResponse, { CategoryObject, InfoStatusResponse } from "../web-interface/StatusResponse";

type Obj = {
  [key: string]: string;
};

type Params = {
  webInterface: VLCWebInterface;
};
export default class Service {
  #webInterface: VLCWebInterface;

  constructor( {webInterface}: Params) {
    this.#webInterface = webInterface;
  }

  async getStatus(): Promise<RemotePlayerStatusResponse> {
    const isRunning = await VLCProcess.isRunningAsync();
    const status: RemotePlayerStatusResponse = {
      running: isRunning,
    };
    let remoteStatus: StatusResponse | undefined;
    let remotePlaylist: PlaylistResponse | undefined;
    const promise1 = this.#webInterface.fetchShowStatus().catch(e => {
      if (!(e instanceof ServiceUnavailableError))
        console.log(e);

      return undefined;
    } )
      .then((s) => {
        remoteStatus = s;
      } );
    const promise2 = this.#webInterface.fetchPlaylist().catch(e => {
      if (!(e instanceof ServiceUnavailableError))
        console.log(e);

      return undefined;
    } )
      .then(p => {
        remotePlaylist = p;
      } );

    await Promise.all([ promise1, promise2 ]);

    if (remoteStatus) {
      status.status = {
        time: Math.max(remoteStatus.root.time, 0),
        length: remoteStatus.root.length,
        state: remoteStatus.root.state,
        volume: remoteStatus.root.volume,
        original: remoteStatus,
      };

      const category = remoteStatus?.root?.information?.category;

      if (status.status && category) {
        let meta: CategoryObject;

        if (Array.isArray(category)) {
          const metaCandidate = category.find(c => c["@_name"] === "meta");

          assertIsDefined(metaCandidate);
          meta = metaCandidate;

          const info = category.splice(1);

          status.status.info = info?.map((c: any) => ( {
            [c["@_name"]]: c.info.reduce((acc: Obj, i: Obj) => {
              acc[i["@_name"]] = i["#text"];

              return acc;
            }, {
            } ),
          } ));
        } else
          meta = category;

        status.status.meta = {
          title: decode(meta.info?.find((i: InfoStatusResponse) => i["@_name"] === "title")?.["#text"]?.toString()),
          filename: meta.info?.find((i: InfoStatusResponse) => i["@_name"] === "filename")?.["#text"]?.toString(),
        };
      }

      const transPlaylistElements = remotePlaylist?.node.node[0].leaf?.map((l: PlaylistELement) => {
        const ret: RemotePlayerPlaylistElement = {
          id: +l["@_id"],
          name: l["@_name"],
          duration: +l["@_duration"],
          uri: l["@_uri"],
        };

        if (l["@_current"] === "current")
          ret.current = true;

        return ret;
      } );
      let current;
      let gotCurrent = false;
      const previous = [];
      const next = [];

      for (const e of transPlaylistElements ?? []) {
        if (gotCurrent)
          next.push(e);

        if (e.current) {
          current = e;
          gotCurrent = true;
        } else if (!gotCurrent)
          previous.push(e);
      }

      status.status.playlist = {
        previous,
        current,
        next,
      };
    }

    assertIsRemotePlayerStatusResponse(status);

    return status;
  }

  async pauseToggle() {
    const ret = await this.#webInterface.fetchTogglePause();

    return {
      state: ret.root.state,
    };
  }

  async getPlaylist() {
    const ret = await this.#webInterface.fetchPlaylist();

    return ret;
  }

  async next(): Promise<void> {
    await this.#webInterface.fetchNext();
  }

  async previous(): Promise<void> {
    await this.#webInterface.fetchPrevious();
  }

  async stop(): Promise<void> {
    await this.#webInterface.fetchStop();
  }

  async toggleFullScreen(): Promise<void> {
    await this.#webInterface.fetchToggleFullscreen();
  }

  async seek(val: number | string): Promise<TimeRet> {
    const res = await this.#webInterface.fetchSeek(val);

    return {
      time: res.root.time,
    };
  }

  async play(id: number): Promise<void> {
    await this.#webInterface.fetchPlay(id);
  }
}

type TimeRet = {
  time: number;
};