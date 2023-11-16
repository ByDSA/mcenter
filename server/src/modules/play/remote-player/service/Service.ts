/* eslint-disable no-use-before-define */
import { assertIsRemotePlayerStatusResponse, RemotePlayerPlaylistElement, RemotePlayerStatusResponse } from "#shared/models/player";
import { assertIsDefined } from "#shared/utils/validation";
import { decode } from "html-entities";
import { VLCWebInterface } from "../web-interface";
import PlaylistResponse, { PlaylistELement } from "../web-interface/PlaylistResponse";
import StatusResponse, { CategoryObject, InfoObject, InfoStatusResponse } from "../web-interface/StatusResponse";

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

  async getStatusOrFail(): Promise<RemotePlayerStatusResponse> {
    const isRunning = await this.#webInterface.isVlcRunning();
    const status: RemotePlayerStatusResponse = {
      running: isRunning,
    };
    let remoteStatus: StatusResponse | undefined;
    let remotePlaylist: PlaylistResponse | undefined;
    const promise1 = this.#webInterface.fetchSecureShowStatus()
      .then((s) => {
        if (!s)
          return;

        remoteStatus = s;
      } );
    const promise2 = this.#webInterface.fetchSecurePlaylist()
      .then(p => {
        if (!p)
          return;

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

        let titleInfo: InfoObject | undefined;
        let filenameInfo: InfoObject | undefined;

        if (Array.isArray(meta.info)) {
          titleInfo = meta.info.find((i: InfoStatusResponse) => i["@_name"] === "title");
          filenameInfo = meta.info.find((i: InfoStatusResponse) => i["@_name"] === "filename");
        } else
          titleInfo = meta?.info?.["@_name"] === "title" ? meta.info : undefined;

        const titleOriginal = titleInfo?.["#text"]?.toString();
        const title = titleOriginal ? decode(titleOriginal) : undefined;
        const filename = filenameInfo?.["#text"]?.toString();

        status.status.meta = {
          title,
          filename,
        };
      }

      let transPlaylistElements: RemotePlayerPlaylistElement[] = [];
      const leaf = remotePlaylist?.node.node[0].leaf;
      const leafElementMap = (l: PlaylistELement) => {
        const ret: RemotePlayerPlaylistElement = {
          id: +l["@_id"],
          name: l["@_name"],
          duration: +l["@_duration"],
          uri: l["@_uri"],
        };

        if (l["@_current"] === "current")
          ret.current = true;

        return ret;
      };

      if (leaf && Array.isArray(leaf))
        transPlaylistElements = leaf?.map(leafElementMap);
      else if (leaf && !Array.isArray(leaf))
        transPlaylistElements = [leafElementMap(leaf)];

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
    const ret = await this.#webInterface.fetchSecureTogglePause();

    if (!ret)
      return null;

    return {
      state: ret.root.state,
    };
  }

  async getPlaylist() {
    const ret = await this.#webInterface.fetchSecurePlaylist();

    return ret;
  }

  async next(): Promise<void> {
    await this.#webInterface.fetchSecureNext();
  }

  async previous(): Promise<void> {
    await this.#webInterface.fetchSecurePrevious();
  }

  async stop(): Promise<void> {
    await this.#webInterface.fetchSecureStop();
  }

  async toggleFullScreen(): Promise<void> {
    await this.#webInterface.fetchSecureToggleFullscreen();
  }

  async seek(val: number | string): Promise<TimeRet | null> {
    const res = await this.#webInterface.fetchSecureSeek(val);

    if (!res)
      return null;

    return {
      time: Math.max(res.root.time, 0),
    };
  }

  async play(id: number): Promise<void> {
    await this.#webInterface.fetchPlay(id);
  }
}

type TimeRet = {
  time: number;
};