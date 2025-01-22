import { HistoryListId } from "#shared/models/historyLists";
import { SerieId } from "#shared/models/series";

export type DependenciesList = {[key: SerieId]: [HistoryListId, HistoryListId][]};

export const dependencies: DependenciesList = {
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
