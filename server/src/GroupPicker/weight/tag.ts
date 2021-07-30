import { findResourceByTypeAndId } from "../../db/models/resources/types";
import { dynamicLoadScriptFromEnvVar } from "../../DynamicLoad";
import { FuncParams } from "../Params";

export default async function weightTag( { self, picker }: FuncParams): Promise<number> {
  let weight = picker.getWeight(self) ?? 1;
  const resource = await findResourceByTypeAndId( {
    type: self.type,
    id: self.id,
  } );

  if (!resource)
    throw new Error();

  const { tags } = resource;

  if (!tags)
    return weight;

  const calendarFunc = await dynamicLoadScriptFromEnvVar("CALENDAR_FILE");
  const calendar = calendarFunc();
  const tagFuncPromise = dynamicLoadScriptFromEnvVar("TAG_FILE");

  return tagFuncPromise.then((f) => {
    for (const t of tags)
      weight *= f(t, calendar);

    return weight;
  } );
}
