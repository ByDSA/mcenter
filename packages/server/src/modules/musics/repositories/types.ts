import { MusicVO } from "../models";
import { PatchPath } from "#sharedSrc/models/utils/schemas/patch";

export type PatchOneParams = {
  entity: Partial<MusicVO>;
  unset?: PatchPath[];
};
