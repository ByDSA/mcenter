import pickNext from "@actions/GroupPicker/pickNext";
import Mode from "@app/actions/GroupPicker/mode";
import App from "@app/app";
import { findResourceByTypeAndId } from "@app/db/models/resources/types";
import get, { Params as GetParams } from "../get";
import getObjWithFullPath from "./getObj";

type Params = GetParams & {mode: Mode, app: App};
export default async function pick(params: Params) {
  const gotGroup = await get(params);

  if (!gotGroup)
    return null;

  const itemGroup = await pickNext( {
    group: gotGroup,
    mode: params.mode,
  } );
  const resource = await findResourceByTypeAndId(itemGroup);

  if (!resource)
    return null;

  const ret = getObjWithFullPath( {
    resource,
    type: itemGroup.type,
    app: params.app,
  } );

  return ret;
}
