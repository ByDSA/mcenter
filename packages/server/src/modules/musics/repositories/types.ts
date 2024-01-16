import { MusicVO } from "#shared/models/musics";
import { PatchPath } from "#sharedSrc/models/utils/dtos";

export type PatchOneParams = {
  entity: Partial<MusicVO>;
  unset?: PatchPath[];
};

export type FindParams = {
  tags?: string[];
  weight?: {
    max?: number;
    min?: number;
  };
};

export type FindQueryParams = {
  tags?: {
    $in: string[];
  };
  weight?: {
    $gte?: number;
    $lte?: number;
  };
};