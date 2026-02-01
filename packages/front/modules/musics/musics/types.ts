import { MusicCrudDtos } from "$shared/models/musics/dto/transport";
import { WithRequired } from "$shared/utils/objects/types";

export type OriginalData = MusicCrudDtos.GetMany.Response["data"][0];

export type Data = WithRequired<OriginalData, "fileInfos">;

export type ArrayData = Data[];
