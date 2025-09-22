import { WithRequired } from "$shared/utils/objects/types";
import { MusicsApi } from "../requests";

export type OriginalData = MusicsApi.GetManyByCriteria.Response["data"][0];

export type Data = WithRequired<OriginalData, "fileInfos">;

export type ArrayData = Data[];
