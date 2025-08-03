import { PatchEvent } from "#core/domain-event-emitter";
import { EpisodeFileInfoEntity } from "../../models";

export namespace EpisodeFileInfoEvents {
  const MAIN_TYPE = "episodeFileInfos";
  export const WILDCARD = `${MAIN_TYPE}.*`;

  export namespace Patch {
    export const TYPE = `${MAIN_TYPE}.patch`;
    export type Event = PatchEvent<EpisodeFileInfoEntity, EpisodeFileInfoEntity["id"]>;
  }
}
