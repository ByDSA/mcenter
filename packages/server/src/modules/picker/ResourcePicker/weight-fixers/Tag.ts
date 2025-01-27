import { dynamicLoadScriptFromEnvVar } from "../../../../DynamicLoad";
import { WeightFixer, WeightFixerParams } from "./WeightFixer";
import { Pickable, Taggable } from "#modules/resources/models";

// TODO: externalizar calendar y tag y luego hacer los tests

type Model = Pickable & Taggable;
export class TagWeightFixer implements WeightFixer<Model> {
  async fixWeight( { resource, currentWeight }: WeightFixerParams<Model>): Promise<number> {
    let weight = currentWeight ?? 0;

    if (resource && !resource.tags)
      return weight;

    const tags = resource?.tags || [];
    const calendarFunc = await dynamicLoadScriptFromEnvVar("CALENDAR_FILE");
    const calendar = calendarFunc();
    const tagFuncPromise = dynamicLoadScriptFromEnvVar("TAG_FILE");

    return tagFuncPromise.then((f) => {
      for (const t of tags)
        weight *= f(t, calendar);

      return weight;
    } );
  }
}
