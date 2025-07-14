import { decode } from "html-entities";
import { assertIsDefined } from "$shared/utils/validation";
import { PlayerPlaylistElement, PlayerStatusResponse, assertIsPlayerStatusResponse } from "#modules/models";
import { CategoryObject, InfoObject, InfoStatusResponse, PlaylistELement, PlaylistResponse as VlcPlaylistResponse, StatusResponse as VlcStatusResponse } from "#modules/vlc/http-interface/responses";

type Obj = {
  [key: string]: string;
};

export function vlcResponsesToGenericResponses(
  isVlcOpen: boolean,
  vlcStatusResponse: VlcStatusResponse | null | undefined,
  vlcPlayListResponse: VlcPlaylistResponse | undefined,
): PlayerStatusResponse {
  const remoteStatus: VlcStatusResponse | null | undefined = vlcStatusResponse;
  const remotePlaylist: VlcPlaylistResponse | undefined = vlcPlayListResponse;
  const status: PlayerStatusResponse = {
    open: isVlcOpen,
  };

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
          }, {} ),
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

    let transPlaylistElements: PlayerPlaylistElement[] = [];
    const leaf = remotePlaylist?.node.node[0].leaf;
    const leafElementMap = (l: PlaylistELement) => {
      const ret: PlayerPlaylistElement = {
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

  assertIsPlayerStatusResponse(status);

  return status;
}
