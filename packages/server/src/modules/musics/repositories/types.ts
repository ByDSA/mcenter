import { MusicVO } from "#shared/models/musics";
import { PatchPath } from "#sharedSrc/models/utils/dtos";

export type PatchOneParams = {
  entity: Partial<MusicVO>;
  unset?: PatchPath[];
};
