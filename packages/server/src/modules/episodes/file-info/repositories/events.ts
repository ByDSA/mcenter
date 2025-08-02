import { EpisodeFileInfoEntity } from "../models";
import { PatchEvent } from "#main/domain-event-emitter";

export namespace EpisodeFileInfoEvents {
  const MAIN_TYPE = "episodeFileInfos";
  export const WILDCARD = `${MAIN_TYPE}.*`;

  export namespace Patch {
    export const TYPE = `${MAIN_TYPE}.patch`;
    export type Event = PatchEvent<EpisodeFileInfoEntity, EpisodeFileInfoEntity["id"]>;
  }
}
