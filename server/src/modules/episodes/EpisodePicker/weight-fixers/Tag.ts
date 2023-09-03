/* eslint-disable class-methods-use-this */
import { dynamicLoadScriptFromEnvVar } from "#DynamicLoad";
import { Model } from "../../models";
import WeightFixer, { WeightFixerParams } from "./WeightFixer";

export default class TagWeightFixer implements WeightFixer<Model> {
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