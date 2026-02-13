import { Taggable } from "#modules/resources/models";
import { dynamicLoadScriptFromEnvVar } from "../../../../dynamic-load";
import { WeightFixer, WeightFixerParams } from "./weight-fixer";

// TODO: externalizar calendar y tag y luego hacer los tests
type Model = Taggable;
export class TagWeightFixer implements WeightFixer<Model> {
  static calendarFuncPromise: Promise<any>;

  static tagFuncPromise: Promise<any>;

  static {
    this.calendarFuncPromise = dynamicLoadScriptFromEnvVar("CALENDAR_FILE");

    this.tagFuncPromise = dynamicLoadScriptFromEnvVar("TAG_FILE");
  }

  async fixWeight( { resource, currentWeight }: WeightFixerParams<Model>): Promise<number> {
    let weight = currentWeight ?? 0;

    if (resource && !resource.tags)
      return weight;

    const tags = resource?.tags || [];
    const calendar = (await TagWeightFixer.calendarFuncPromise)();

    return TagWeightFixer.tagFuncPromise.then((f) => {
      for (const t of tags)
        weight *= f(t, calendar);

      return weight;
    } );
  }
}
