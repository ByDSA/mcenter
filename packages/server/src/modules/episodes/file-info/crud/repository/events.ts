import { EpisodeFileInfoCrudDtos } from "$shared/models/episodes/file-info/dto/transport";
import { PatchEvent } from "#core/domain-event-emitter";
import { EpisodeFileInfoEntity } from "../../models";

export namespace EpisodeFileInfoEvents {
  const MAIN_TYPE = "episodeFileInfos";
  export const WILDCARD = `${MAIN_TYPE}.*`;

  export namespace Patch {
    export const TYPE = `${MAIN_TYPE}.patch`;
    export type Event = PatchEvent<
    EpisodeFileInfoCrudDtos.Patch.Body["entity"],
    EpisodeFileInfoEntity,
    EpisodeFileInfoEntity["id"]
    >;
  }
}
