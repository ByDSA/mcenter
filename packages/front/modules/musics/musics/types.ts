import { MusicsApi } from "../requests";

export type OriginalData = MusicsApi.GetManyByCriteria.Response["data"][0];

export type Data = OriginalData & Required<Pick<OriginalData, "fileInfos">>;

export type ArrayData = Data[];
