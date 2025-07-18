import z from "zod";
import { CriteriaSortDir } from "../../../../utils/criteria";

export enum CriteriaSort {
  lastTimePlayed = "lastTimePlayed",
};

export enum CriteriaExpand {
  series = "series",
}

export const criteriaSchema = z.object( {
  expand: z.array(z.nativeEnum(CriteriaExpand)).optional(),
  sort: z.object( {
    [CriteriaSort.lastTimePlayed]: z.nativeEnum(CriteriaSortDir).optional(),
  } ).optional(),
} ).strict();

export const getManyByCriteria = {
  reqBodySchema: criteriaSchema,
};
