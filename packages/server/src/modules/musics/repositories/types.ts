import { MusicVO } from "#shared/models/musics";

export type PatchOneParams = {
  entity: Partial<MusicVO>;
  unset?: (keyof MusicVO)[];
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