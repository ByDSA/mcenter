import { Episode } from "#modules/series/episode";
import { getDaysFromLastPlayed } from "../../lastPlayed";
import { compareEpisodeId } from "../../model/Episode";
import { Params } from "../utils";

export const preventRepeatLast = ( { self, lastEp }: Params<Episode>) => {
  if (!lastEp)
    return true;

  if (!compareEpisodeId(lastEp.id, self.id))
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
  idLast: string,
  self: Episode,
  idCurrent: string,
): boolean {
  return (lastEp?.id.innerId === idLast && self.id.innerId === idCurrent)
  || (lastEp?.id.innerId !== idLast && self.id.innerId !== idCurrent);
}

export function preventDisabled( { self }: Params<Episode>) {
  const ret = self.disabled === undefined || self.disabled === false;

  return ret;
}

export function removeWeightLowerOrEqualThan(num: number) {
  return ( { self }: Params<Episode>): boolean => self.weight > num;
}

export function preventRepeatInDays(minDays: number) {
  return ( { self, serie, historyList }: Params<Episode>): boolean => {
    const daysFromLastTime = getDaysFromLastPlayed(self, serie.id, historyList);

    return daysFromLastTime >= minDays;
  };
}