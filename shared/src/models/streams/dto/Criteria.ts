/* eslint-disable import/prefer-default-export */
import { z } from "zod";
import { CriteriaSortDir } from "../../../utils/criteria";

export enum CriteriaSort {
  lastTimePlayed = "lastTimePlayed",
};

export enum CriteriaExpand {
  series = "series",
}

export const SearchSchema = z.object( {
  expand: z.array(z.nativeEnum(CriteriaExpand)).optional(),
  sort: z.object( {
    [CriteriaSort.lastTimePlayed]: z.nativeEnum(CriteriaSortDir).optional(),
  } ).optional(),
} ).strict();