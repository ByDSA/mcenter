import { Episode } from "#modules/episodes";
import LastTimePlayedService from "../../LastTimePlayedService";
import { ModelId, compareFullId } from "../../models/Episode";
import { Params } from "../utils";

export const preventRepeatLast = ( { self, lastEp }: Params<Episode>) => {
  if (!lastEp)
    return true;

  if (!compareFullId(lastEp, self))
    return true;

  return false;
};

type Obj = {
  [key: string]: [string, string][];
};

export function dependent( { self, lastEp, serie }: Params<Episode>) {
  let ret = true;
  const obj: Obj = {
    simpsons: [
      ["6x25", "7x01"],
	        ["31x19", "31x20"],
    ],
    fguy: [
      ["6x04", "6x05"],
      ["4x28", "4x29"],
      ["4x29", "4x30"],
      ["12x06", "12x07"],
      ["12x07", "12x08"],
    ],
  };
  const dependencies = obj[serie.id] || [];

  for (const d of dependencies)
    ret &&= dependency(lastEp, d[0], self, d[1]);

  return ret;
}

function dependency(
  lastEp: Episode | null,
  idLast: ModelId,
  self: Episode,
  idCurrent: ModelId,
): boolean {
  return (lastEp?.episodeId === idLast && self.episodeId === idCurrent)
  || (lastEp?.episodeId !== idLast && self.episodeId !== idCurrent);
}

export function preventDisabled( { self }: Params<Episode>) {
  const ret = self.disabled === undefined || self.disabled === false;

  return ret;
}

export function removeWeightLowerOrEqualThan(num: number) {
  return ( { self }: Params<Episode>): boolean => self.weight > num;
}

export function preventRepeatInDays(minDays: number) {
  return ( { self, historyList }: Params<Episode>): boolean => {
    const lastTimePlayedService = new LastTimePlayedService();
    const daysFromLastTime = lastTimePlayedService.getDaysFromLastPlayed(self, historyList);

    return daysFromLastTime >= minDays;
  };
}