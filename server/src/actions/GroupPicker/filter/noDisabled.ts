import { FuncParams } from "../Params";

export default function preventDisabled( { self }: FuncParams) {
  // const resource = await getResourceFromItem(self);
  // const ret = resource.disabled === undefined || resource.disabled === false;
  const ret = !!self;

  return ret;
}
