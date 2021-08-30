import Mode from "@actions/GroupPicker/mode";
import pickNext from "@actions/GroupPicker/pickNext";
import { findSerieByUrl, getEpisodeById } from "@app/db/models/resources/serie";
import get, { Params as GetParams } from "./get";

type Params = GetParams & { mode: Mode };
export default async function pick(params: Params) {
  const gotSerieGroup = await get(params);

  if (!gotSerieGroup)
    return null;

  const epGroupPickedPromise = pickNext( {
    group: gotSerieGroup,
    // TODO: add history
    mode: params.mode,
  } );
  const serie = await findSerieByUrl(params.serieUrl);

  if (!serie)
    return null;

  const ep = getEpisodeById( {
    serie,
    id: (await epGroupPickedPromise).id,
  } );

  return ep;
}
