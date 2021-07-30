import Mode from "@app/GroupPicker/mode";
import pickNext from "../../../GroupPicker/pickNext";
import get from "./get";

type Params = {username: string, group: string, mode: Mode};
export default async function pick(params: Params) {
  const gotGroup = await get(params);

  if (!gotGroup)
    return null;

  const ret = pickNext( {
    group: gotGroup,
    mode: params.mode,
  } );

  return ret;
}
