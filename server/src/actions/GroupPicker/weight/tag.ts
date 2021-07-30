import { dynamicLoadScriptFromEnvVar } from "@actions/utils/DynamicLoad";
import { ItemGroup } from "@app/db/models/resources/group/interface";
import { findResourceByTypeAndId } from "@models/resources/types";
import { FuncParams } from "../Params";

export default async function weightTag( { self, picker }: FuncParams): Promise<number> {
  let weight = picker.getWeight(self) ?? 1;
  const tags = await getTags(self);

  if (!tags || tags.length === 0)
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

async function getTags(self: ItemGroup) {
  const resource = await findResourceByTypeAndId( {
    type: self.type,
    id: self.id,
  } );

  if (!resource)
    console.error(`Cannot find resource of type ${JSON.stringify(self.type)} with id ${self.id}`);

  const tags: string[] = [];

  if (resource && resource.tags)
    tags.push(...resource.tags);

  if (self.tags)
    tags.push(...self.tags);

  return tags;
}
