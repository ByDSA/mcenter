import Mode from "@app/actions/GroupPicker/mode";
import pickNext from "../../../actions/GroupPicker/pickNext";
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
